/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Folder');

goog.require('Blockly.Instrument'); // lyn's instrumentation code
goog.require('Blockly.FolderSvg');
goog.require('Blockly.Blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.Connection');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.ErrorIcon');
goog.require('Blockly.Input');
goog.require('Blockly.Msg');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.WarningHandler');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('Blockly.Block');

Blockly.FOLDER_CATEGORY_HUE = [241, 213, 146];

Blockly.ALL_FOLDERS = [];

/**
 * Class for one block.
 * @constructor
 */
Blockly.Folder = function() {
    // We assert this here because there may be users of the previous form of
    // this constructor, which took arguments.
    goog.asserts.assert(arguments.length == 0,
        'Please use Blockly.Folder.obtain.');
};

goog.inherits(Blockly.Folder,Blockly.Block);

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Folder} The created block
 */
Blockly.Folder.obtain = function(workspace, prototypeName) {
    if (Blockly.Realtime.isEnabled()) {
        return Blockly.Realtime.obtainBlock(workspace, prototypeName);
    } else {
        var newFolder = new Blockly.Folder();
        newFolder.initialize(workspace, prototypeName);
        return newFolder;
    }
};

/**
 * Initialization for one block.
 * @param {!Blockly.Workspace} workspace The new block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
Blockly.Folder.prototype.initialize = function(workspace, prototypeName) {
    this.id = Blockly.genUid();
    workspace.addTopBlock(this);
    Blockly.ALL_FOLDERS.push(this);
    this.fill(workspace, prototypeName);
    // Bind an onchange function, if it exists.
    if (goog.isFunction(this.onchange)) {
        Blockly.bindEvent_(workspace.getCanvas(), 'blocklyWorkspaceChange', this,
            this.onchange);
    }
};

/**
 * Fill a block with initial values.
 * @param {!Blockly.Workspace} workspace The workspace to use.
 * @param {string} prototypeName The typename of the block.
 */
Blockly.Folder.prototype.fill = function(workspace, prototypeName) {
    this.outputConnection = null;
    this.nextConnection = null;
    this.previousConnection = null;
    this.inputList = [];
    this.inputsInline = false;
    this.rendered = false;
    this.disabled = false;
    this.tooltip = '';
    this.contextMenu = true;

    this.parentBlock_ = null;
    this.childBlocks_ = [];
    this.deletable_ = true;
    this.movable_ = true;
    this.editable_ = true;
    this.collapsed_ = false;

    this.miniworkspace = null;
    this.expandedFolder_ = false;
    this.workspace = workspace;
    this.isInFlyout = workspace.isFlyout;
    // This is missing from our latest version
    //workspace.addTopBlock(this);

    // Copy the type-specific functions and data from the prototype.
    if (prototypeName) {
        this.type = prototypeName;
        var prototype = Blockly.Blocks[prototypeName];
        goog.asserts.assertObject(prototype,
            'Error: "%s" is an unknown language block.', prototypeName);
        goog.mixin(this, prototype);
    }
    // Call an initialization function, if it exists.
    if (goog.isFunction(this.init)) {
        this.init();
    }
    // Bind an onchange function, if it exists.
    if ((!this.isInFlyout) && goog.isFunction(this.onchange)) {
        Blockly.bindEvent_(workspace.getCanvas(), 'blocklyWorkspaceChange', this,
            this.onchange);
    }
};

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array} List of icons.
 */
Blockly.Folder.prototype.getIcons = function() {
    var icons = [];
    if (this.mutator) {
        icons.push(this.mutator);
    }
    if (this.comment) {
        icons.push(this.comment);
    }
    if (this.warning) {
        icons.push(this.warning);
    }
    if (this.errorIcon) {
        icons.push(this.errorIcon);
    }
    if (this.miniworkspace) {
        icons.push(this.miniworkspace);
    }
    return icons;
};

/**
 * Create and initialize the SVG representation of the block.
 */
Blockly.Folder.prototype.initSvg = function() {
    this.svg_ = new Blockly.FolderSvg(this);
    this.svg_.init();
    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.svg_.getRootElement(), 'mousedown', this,
            this.onMouseDown_);
    }
    this.workspace.getCanvas().appendChild(this.svg_.getRootElement());
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Folder.terminateDrag_ = function() {
    if (Blockly.Folder.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.Folder.onMouseUpWrapper_);
        Blockly.Folder.onMouseUpWrapper_ = null;
    }
    if (Blockly.Folder.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.Folder.onMouseMoveWrapper_);
        Blockly.Folder.onMouseMoveWrapper_ = null;
    }
    var selected = Blockly.selected;
    if (Blockly.Folder.dragMode_ == 2) {
        console.log("terminate");
        // Terminate a drag operation.
        if (selected) {
            // Update the connection locations.
            var xy = selected.getRelativeToSurfaceXY();
            var dx = xy.x - selected.startDragX;
            var dy = xy.y - selected.startDragY;
            selected.moveConnections_(dx, dy);
            delete selected.draggedBubbles_;
            selected.setDragging_(false);
            selected.render();
            goog.Timer.callOnce(
                selected.bumpNeighbours_, Blockly.BUMP_DELAY, selected);
            // Fire an event to allow scrollbars to resize.
            Blockly.fireUiEvent(window, 'resize');
        }
    }
    if (selected) {
        selected.workspace.fireChangeEvent();
    }
    Blockly.Folder.dragMode_ = 0;
};

Blockly.Folder.prototype.removeFromAllFolders = function(folder) {
    var found = false;
    for (var f, x = 0; f = Blockly.ALL_FOLDERS[x]; x++) {
        if (f == folder) {
            Blockly.ALL_FOLDERS.splice(x, 1);
            found = true;
            break;
        }
    }
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Folder.prototype.onMouseUp_ = function(e) {
    var start = new Date().getTime();
    Blockly.Instrument.initializeStats("onMouseUp");
    var this_ = this;
    Blockly.resetWorkspaceArrangements();
    Blockly.doCommand(function() {
    Blockly.terminateDrag_();
    if (Blockly.selected && Blockly.highlightedConnection_) {
      // Connect two blocks together.
      Blockly.localConnection_.connect(Blockly.highlightedConnection_);
      if (this_.svg_) {
        // Trigger a connection animation.
        // Determine which connection is inferior (lower in the source stack).
        var inferiorConnection;
        if (Blockly.localConnection_.isSuperior()) {
          inferiorConnection = Blockly.highlightedConnection_;
        } else {
          inferiorConnection = Blockly.localConnection_;
        }
        inferiorConnection.sourceBlock_.svg_.connectionUiEffect();
      }
      if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
        // Don't throw an object in the trash can if it just got connected.
        this_.workspace.trashcan.close();
      }
    } else if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
      var trashcan = this_.workspace.trashcan;
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
      if (Blockly.selected.confirmDeletion()) {
        Blockly.selected.dispose(false, true);
      }
      // Dropping a block on the trash can will usually cause the workspace to
      // resize to contain the newly positioned block.  Force a second resize
      // now that the block has been deleted.
      Blockly.fireUiEvent(window, 'resize');
    } else if (Blockly.ALL_FOLDERS.length > 0) {
        for (var i = 0; i < Blockly.ALL_FOLDERS.length; i++) {
            var folder = Blockly.ALL_FOLDERS[i];
            if (folder != this) {
                if (folder.isOverFolder(e) && !this.isInFolder) {
                    folder.upOverFolder(e, this, true);
                } else if (!folder.isOverFolder(e) && this.isInFolder) {
                    folder.upOverFolder(e, this, false);
                }
            }
        }
    }
        if (Blockly.highlightedConnection_) {
            Blockly.highlightedConnection_.unhighlight();
            Blockly.highlightedConnection_ = null;
        }
    });
    if (! Blockly.Instrument.avoidRenderWorkspaceInMouseUp) {
        // [lyn, 04/01/14] rendering a workspace takes a *long* time and is *not* necessary!
        // This is the key source of the laggy drag problem. Remove it!
        Blockly.mainWorkspace.render();
    }
    Blockly.WarningHandler.checkAllBlocksForWarningsAndErrors();
    var stop = new Date().getTime();
    var timeDiff = stop - start;
    Blockly.Instrument.stats.totalTime = timeDiff;
    Blockly.Instrument.displayStats("onMouseUp");
};

/**
 * Give this block a mini workspace.
 * @param {Blockly.MiniWorkspace} miniworkspace A mini workspace.
 */
Blockly.Folder.prototype.setMiniWorkspace = function(miniworkspace) {
    if (this.miniworkspace && this.miniworkspace !== miniworkspace) {
        this.miniworkspace.dispose();
    }
    if (miniworkspace) {
        miniworkspace.block_ = this;
        this.miniworkspace = miniworkspace;
        if (this.svg_) {
            miniworkspace.createIcon();
        }
    }
};

Blockly.Folder.prototype.isOverFolder = function(e) {
    if (this.expandedFolder_){
        var mouseXY = Blockly.mouseToSvg(e);
        var folderXY = Blockly.getSvgXY_(this.miniworkspace.bubble_.bubbleGroup_);
        var width = this.miniworkspace.bubble_.width;
        var height = this.miniworkspace.bubble_.height;
        var over = (mouseXY.x > folderXY.x) &&
            (mouseXY.x < folderXY.x + width) &&
            (mouseXY.y > folderXY.y) &&
            (mouseXY.y < folderXY.y + height);
        return over;
    } else {
        return false;
    }
}

Blockly.Folder.prototype.addToFolder = function(block) {
    var dom = Blockly.Xml.blockToDom_(block);
    var bl = Blockly.Xml.domToBlock(this.miniworkspace, dom);
    bl.isInFolder = true;
    block.dispose();
}

Blockly.Folder.prototype.removeFromFolder = function(block) {
    block.isInFolder = false;
}

Blockly.Folder.prototype.upOverFolder = function(e, block, inFolder) {
    if (!inFolder) {
        this.addToFolder(block);
    } else {
        this.removeFromFolder(block);
    }
}

