'use strict';

goog.provide('Blockly.MiniWorkspace');

goog.require('Blockly.MiniBubble');
goog.require('Blockly.Icon');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Trashcan');
goog.require('Blockly.Xml');

/**
 * Class for a mini workspace. 
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.MiniWorkspace = function(getMetrics, setMetrics) {
  this.getMetrics = getMetrics;
  this.setMetrics = setMetrics;

  /** @type {boolean} */
  this.isFlyout = false;
  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
    this.topBlocks_ = [];

  /** @type {number} */
  this.maxBlocks = Infinity;

  Blockly.ConnectionDB.init(this);
};
goog.inherits(Blockly.MiniWorkspace, Blockly.Icon);

/**
 * Width of workspace.
 * @private
 */
Blockly.MiniWorkspace.prototype.workspaceWidth_ = 0;

/**
 * Height of workspace.
 * @private
 */
Blockly.MiniWorkspace.prototype.workspaceHeight_ = 0;

/**
 * Create the icon on the block.
 */
Blockly.MiniWorkspace.prototype.createIcon = function() {
    Blockly.Icon.prototype.createIcon_.call(this);
    /* Here's the markup that will be generated:
     <rect class="blocklyIconShield" width="16" height="16" rx="4" ry="4"/>
     <text class="blocklyIconMark" x="8" y="12">★</text>
     */
    var quantum = Blockly.Icon.RADIUS / 2;
    var iconShield = Blockly.createSvgElement('rect',
        {'class': 'blocklyIconShield',
            'width': 4 * quantum,
            'height': 4 * quantum,
            'rx': quantum,
            'ry': quantum}, this.iconGroup_);
    this.iconMark_ = Blockly.createSvgElement('text',
        {'class': 'blocklyIconMark',
            'x': Blockly.Icon.RADIUS,
            'y': 2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
    this.iconMark_.appendChild(document.createTextNode('\u002b'));
    //this.iconMark_.appendChild(document.createTextNode('\u2605'));
};

Blockly.MiniWorkspace.prototype.toggleIcon = function() {
    this.block_.expandedFolder_ = !this.block_.expandedFolder_;
    this.iconMark_.innerHTML = (this.iconMark_.innerHTML == "+" ? "-" : "+");
};

/**
 * Clicking on the icon toggles if the mutator bubble is visible.
 * Disable if block is uneditable.
 * @param {!Event} e Mouse click event.
 * @private
 * @override
 */
Blockly.MiniWorkspace.prototype.iconClick_ = function(e) {
    this.toggleIcon();
    if (this.block_.isEditable()) {
        Blockly.Icon.prototype.iconClick_.call(this, e);
    }
};

/**
 * Create the editor for the mutator's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.MiniWorkspace.prototype.createEditor_ = function() {
    /* Create the editor.  Here's the markup that will be generated:
     <svg>
     <rect class="blocklyMiniWorkspaceBackground" />
     [Flyout]
     [Workspace]
     </svg>
     */
    this.svgDialog_ = Blockly.createSvgElement('svg',
        {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
        null);
    Blockly.createSvgElement('rect',
        {'class': 'blocklyMutatorBackground',
            'height': '80%', 'width': '50%'}, this.svgDialog_);
    var miniworkspace = this;
    this.workspace_ = new Blockly.Workspace(
        function() {return miniworkspace.getFlyoutMetrics_();}, null);
    //this.flyout_ = new Blockly.Flyout();
    //this.flyout_.autoClose = false;
    //this.svgDialog_.appendChild(this.flyout_.createDom());
    this.svgDialog_.appendChild(this.workspace_.createDom());

    //when mutator bubble is clicked, do not close mutator
    Blockly.bindEvent_(this.svgDialog_, 'mousedown', this.svgDialog_,
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

    return this.svgDialog_;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.MiniWorkspace.prototype.updateEditable = function() {
    if (this.block_.isEditable()) {
        // Default behaviour for an icon.
        Blockly.Icon.prototype.updateEditable.call(this);
    } else {
        // Close any mutator bubble.  Icon is not clickable.
        this.setVisible(false);
        Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
            'blocklyIconGroup');
    }
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the workspace accordingly.
 * @private
 */
Blockly.MiniWorkspace.prototype.resizeBubble_ = function() {
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    try {
        var workspaceSize = this.workspace_.getCanvas().getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        return;
    }
    var flyoutMetrics = this.flyout_.getMetrics_();
    var width;
    if (Blockly.RTL) {
        width = -workspaceSize.x;
    } else {
        width = workspaceSize.width + workspaceSize.x;
    }
    var height = Math.max(workspaceSize.height + doubleBorderWidth * 3,
        //flyoutMetrics.contentHeight + 20);
        20);
    width += doubleBorderWidth * 3;
    // Only resize if the size difference is significant.  Eliminates shuddering.
    //if (Math.abs(this.workspaceWidth_ - width) > doubleBorderWidth ||
    //    Math.abs(this.workspaceHeight_ - height) > doubleBorderWidth) {
    //    // Record some layout information for getFlyoutMetrics_.
        this.workspaceWidth_ = width;
        this.workspaceHeight_ = height;
    //    // Resize the bubble.
    //    this.bubble_.setBubbleSize(width + doubleBorderWidth,
    //        height + doubleBorderWidth);
        this.svgDialog_.setAttribute('width', this.workspaceWidth_);
        this.svgDialog_.setAttribute('height', this.workspaceHeight_);
    //}

    if (Blockly.RTL) {
        // Scroll the workspace to always left-align.
        var translation = 'translate(' + this.workspaceWidth_ + ',0)';
        this.workspace_.getCanvas().setAttribute('transform', translation);
    }
};

/**
 * Show or hide the mutator bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.MiniWorkspace.prototype.setVisible = function(visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }
    if (visible) {
        // Create the bubble.
        this.bubble_ = new Blockly.MiniBubble(this.block_.workspace,
            this.createEditor_(), this.block_.svg_.svgPath_,
            this.iconX_, this.iconY_, null, null);
        var thisObj = this;
        //this.flyout_.init(this.workspace_, false);
        //this.flyout_.show(this.quarkXml_);

        //this.rootBlock_ = this.block_.decompose(this.workspace_);
        //var blocks = this.rootBlock_.getDescendants();
        //for (var i = 0, child; child = blocks[i]; i++) {
        //    child.render();
        //}
        //// The root block should not be dragable or deletable.
        //this.rootBlock_.setMovable(false);
        //this.rootBlock_.setDeletable(false);
        //var margin = this.flyout_.CORNER_RADIUS * 2;
        //var x = this.flyout_.width_ + margin;
        //if (Blockly.RTL) {
        //    x = -x;
        //}
        //this.rootBlock_.moveBy(x, margin);
        //// Save the initial connections, then listen for further changes.
        //if (this.block_.saveConnections) {
        //    this.block_.saveConnections(this.rootBlock_);
        //    this.sourceListener_ = Blockly.bindEvent_(
        //        this.block_.workspace.getCanvas(),
        //        'blocklyWorkspaceChange', this.block_,
        //        function() {thisObj.block_.saveConnections(thisObj.rootBlock_)});
        //}
        //this.resizeBubble_();
        // When the mutator's workspace changes, update the source block.
        Blockly.bindEvent_(this.workspace_.getCanvas(), 'blocklyWorkspaceChange',
            this.block_, function() {thisObj.workspaceChanged_();});
        this.updateColour();
        this.bubble_.positionBubble_();
    } else {
        // Dispose of the bubble.
        this.svgDialog_ = null;
        //this.flyout_.dispose();
        //this.flyout_ = null;
        this.workspace_.dispose();
        this.workspace_ = null;
        this.rootBlock_ = null;
        this.bubble_.dispose();
        this.bubble_ = null;
        this.workspaceWidth_ = 0;
        this.workspaceHeight_ = 0;
        if (this.sourceListener_) {
            Blockly.unbindEvent_(this.sourceListener_);
            this.sourceListener_ = null;
        }
    }
};

/**
 * Update the source block when the mutator's blocks are changed.
 * Delete or bump any block that's out of bounds.
 * Fired whenever a change is made to the mutator's workspace.
 * @private
 */
Blockly.MiniWorkspace.prototype.workspaceChanged_ = function() {
    if (!this.workspace_) return;
    if (Blockly.Block.dragMode_ == 0) {
        var blocks = this.workspace_.getTopBlocks(false);
        var MARGIN = 20;
        for (var b = 0, block; block = blocks[b]; b++) {
            var blockXY = block.getRelativeToSurfaceXY();
            var blockHW = block.getHeightWidth();
            if (block.isDeletable() && (Blockly.RTL ?
                blockXY.x > -this.flyout_.width_ + MARGIN :
                blockXY.x < this.flyout_.width_ - MARGIN)) {
                // Delete any block that's sitting on top of the flyout.
                block.dispose(false, true);
            } else if (blockXY.y + blockHW.height < MARGIN) {
                // Bump any block that's above the top back inside.
                block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
            }
        }
    }

    // When the mutator's workspace changes, update the source block.
    //if (this.rootBlock_.workspace == this.workspace_) {
    //    // Switch off rendering while the source block is rebuilt.
    //    var savedRendered = this.block_.rendered;
    //    this.block_.rendered = false;
    //    // Allow the source block to rebuild itself.
    //    this.block_.compose(this.rootBlock_);
    //    // Restore rendering and show the changes.
    //    this.block_.rendered = savedRendered;
    //    if (this.block_.rendered) {
    //        this.block_.render();
    //    }
    //    //this.resizeBubble_();
    //    // The source block may have changed, notify its workspace.
    //    this.block_.workspace.fireChangeEvent();
    //}
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * mutator flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {!Object} Contains size and position metrics of mutator dialog's
 *     workspace.
 * @private
 */
Blockly.MiniWorkspace.prototype.getFlyoutMetrics_ = function() {
    var left = 0;
    if (Blockly.RTL) {
        left += this.workspaceWidth_;
    }
    return {
        viewHeight: this.workspaceHeight_,
        viewWidth: 0,  // This seem wrong, but results in correct RTL layout.
        absoluteTop: 0,
        absoluteLeft: left
    };
};

/**
 * Dispose of this mutator.
 */
Blockly.MiniWorkspace.prototype.dispose = function() {
    this.block_.miniworkspace = null;
    Blockly.Icon.prototype.dispose.call(this);
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.MiniWorkspace.prototype.addTopBlock = function(block) {
    if (block.workspace == Blockly.mainWorkspace) //Do not reset arrangements for the flyout
        Blockly.resetWorkspaceArrangements();
    this.topBlocks_.push(block);
    if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
        Blockly.Realtime.addTopBlock(block);
    }
    this.fireChangeEvent();
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.MiniWorkspace.prototype.removeTopBlock = function(block) {
    if (block.workspace == Blockly.mainWorkspace) //Do not reset arrangements for the flyout
        Blockly.resetWorkspaceArrangements();
    var found = false;
    for (var child, x = 0; child = this.topBlocks_[x]; x++) {
        if (child == block) {
            this.topBlocks_.splice(x, 1);
            found = true;
            break;
        }
    }
    if (!found) {
        throw 'Block not present in workspace\'s list of top-most blocks.';
    }
    if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
        Blockly.Realtime.removeTopBlock(block);
    }
    this.fireChangeEvent();
};

/**
 * Fire a change event for this workspace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook workspace changes by listening for
 * 'blocklyWorkspaceChange' on Blockly.mainWorkspace.getCanvas().
 */
Blockly.MiniWorkspace.prototype.fireChangeEvent = function() {
    if (this.fireChangeEventPid_) {
        window.clearTimeout(this.fireChangeEventPid_);
    }
    var canvas = this.svgBlockCanvas_;
    if (canvas) {
        this.fireChangeEventPid_ = window.setTimeout(function() {
            Blockly.fireUiEvent(canvas, 'blocklyWorkspaceChange');
        }, 0);
    }
};

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.Workspace.prototype.getCanvas = function() {
    return this.svgBlockCanvas_;
};

/**
 * Create the trash can elements.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.Workspace.prototype.createDom = function() {
    /*
     <g>
     [Trashcan may go here]
     <g></g>
     <g></g>
     </g>
     */
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    this.fireChangeEvent();
    return this.svgGroup_;
};