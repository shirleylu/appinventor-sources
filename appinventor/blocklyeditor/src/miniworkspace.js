'use strict';

goog.provide('Blockly.MiniWorkspace');

goog.require('Blockly.Workspace');

/**
 * Class for a mini workspace. 
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.MiniWorkspace = function() {
  this.isFlyout = false;
  this.topBlocks_ = [];
  this.bubble_ = null;
  this.maxBlocks = Infinity;
};
goog.inherits(Blockly.MiniWorkspace, Blockly.Icon);

Blockly.MiniWorkspace.prototype.workspaceWidth_ = 0;
Blockly.MiniWorkspace.prototype.workspaceHeight_ = 0;

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
    this.iconMark_.appendChild(document.createTextNode('+'));
};

Blockly.MiniWorkspace.prototype.toggleIcon = function() {
    this.block_.expandedFolder_ = !this.block_.expandedFolder_;
    this.iconMark_.innerHTML = (this.iconMark_.innerHTML == "+" ? "-" : "+");
};

Blockly.MiniWorkspace.prototype.iconClick_ = function(e) {
    this.toggleIcon();
    if (this.block_.isEditable()) {
        Blockly.Icon.prototype.iconClick_.call(this, e);
    }
};

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
        Blockly.bindEvent_(this.workspace_.getCanvas(), 'blocklyWorkspaceChange',
            this.block_, function() {thisObj.workspaceChanged_();});
        this.updateColour();
        this.bubble_.positionBubble_();
    } else {
        // Dispose of the bubble.
        this.svgDialog_ = null;
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
}