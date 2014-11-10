'use strict';

goog.provide('Blockly.BlockSvg');

/**
 * Class for a folder's SVG representation.
 * @param {!Blockly.Block} folder The underlying block object.
 * @constructor
 */
Blockly.FolderSvg = function (folder) {
    this.folder_ = folder;
    // Create core elements for the block.
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    this.svgPathDark_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathDark', 'transform': 'translate(1, 1)'},
        this.svgGroup_);
    this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
        this.svgGroup_);
    this.svgPathLight_ = Blockly.createSvgElement('path',
        {'class': 'blocklyPathLight'}, this.svgGroup_);
    this.svgPath_.tooltip = this.folder_;
    Blockly.Tooltip.bindMouseEvents(this.svgPath_);
    this.updateMovable(); //TODO
};

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.FolderSvg.prototype.init = function() {
    var block = this.block_;
    this.updateColour();
    for (var x = 0, input; input = block.inputList[x]; x++) {
        input.init();
    }
    if (block.mutator) {
        block.mutator.createIcon();
    }
};