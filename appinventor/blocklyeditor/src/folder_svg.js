/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FolderSvg');

goog.require('Blockly.Instrument'); // lyn's instrumentation code
goog.require('goog.userAgent');
goog.require('Blockly.BlockSvg');


/**
 * Class for a block's SVG representation.
 * @param {!Blockly.Block} block The underlying block object.
 * @constructor
 */
Blockly.FolderSvg = function(folder) {
    this.block_ = folder;
    // Create core elements for the block.
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgPathDark_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathDark', 'transform': 'translate(1, 1)'},
        this.svgGroup_);
    this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
        this.svgGroup_);
    this.svgPathLight_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathLight'}, this.svgGroup_);
    this.svgPath_.tooltip = this.block_;
    Blockly.Tooltip.bindMouseEvents(this.svgPath_);
    this.updateMovable();
};

goog.inherits(Blockly.FolderSvg,Blockly.BlockSvg);

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.FolderSvg.prototype.init = function() {
    var folder = this.block_;
    this.updateColour();
    for (var x = 0, input; input = folder.inputList[x]; x++) {
        input.init();
    }
    if (folder.mutator) {
        folder.mutator.createIcon();
    }
    if (folder.folderIcon) {
        folder.folderIcon.createIcon();
    }
};
