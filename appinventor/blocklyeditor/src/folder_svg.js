'use strict';

goog.provide('Blockly.BlockSvg');

/**
 * Class for a folder's SVG representation.
 * @param {!Blockly.Folder} folder The underlying block object.
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
    this.updateMovable();
};

/**
 * Initialize the SVG representation with any folder attributes which have
 * already been defined.
 */
Blockly.FolderSvg.prototype.init = function() {
    var folder = this.folder_;
    this.updateColour(); //TODO
    //No inputs for folders
    //for (var x = 0, input; input = folder.inputList[x]; x++) {
    //    input.init();
    //}
    if (folder.mutator) {
        folder.mutator.createIcon(); //TODO
    }
};

/**
 * Add or remove the UI indicating if this folder is movable or not.
 */
Blockly.FolderSvg.prototype.updateMovable = function() {
    if (this.folder_.isMovable()) {
        Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDraggable');
    } else {
        Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
            'blocklyDraggable');
    }
};

/**
 * Change the colour of a folder.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
    if (this.block_.disabled) {
        // Disabled blocks don't have colour.
        return;
    }
    var hexColour = Blockly.makeColour(this.block_.getColour());
    var rgb = goog.color.hexToRgb(hexColour);
    var rgbLight = goog.color.lighten(rgb, 0.3);
    var rgbDark = goog.color.darken(rgb, 0.4);
    this.svgPathLight_.setAttribute('stroke', goog.color.rgbArrayToHex(rgbLight));
    this.svgPathDark_.setAttribute('fill', goog.color.rgbArrayToHex(rgbDark));
    this.svgPath_.setAttribute('fill', hexColour);
};