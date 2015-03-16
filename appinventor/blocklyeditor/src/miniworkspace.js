'use strict';

goog.provide('Blockly.MiniWorkspace');

goog.require('Blockly.MiniBubble');
goog.require('Blockly.Icon');
goog.require('Blockly.Workspace');


/**
 * Class for a mini workspace. 
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.MiniWorkspace = function() {
    this.block_ = this;
};
goog.inherits(Blockly.MiniWorkspace, Blockly.Workspace);

/**
 * Create the icon on the block.
 */
Blockly.MiniWorkspace.prototype.createIcon = function() {

    /* Here's the markup that will be generated:
     <g class="blocklyIconGroup"></g>
     */
    this.iconGroup_ = Blockly.createSvgElement('g', {}, null);
    this.block_.getSvgRoot().appendChild(this.iconGroup_);
    Blockly.bindEvent_(this.iconGroup_, 'mouseup', this, this.iconClick_);
    this.updateEditable();

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

/**
 * Render the icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 */
Blockly.MiniWorkspace.prototype.renderIcon = function(cursorX) {
    if (this.block_.isCollapsed()) {
        this.iconGroup_.setAttribute('display', 'none');
        return cursorX;
    }
    this.iconGroup_.setAttribute('display', 'block');

    var TOP_MARGIN = 5;
    var diameter = 2 * Blockly.Icon.RADIUS;
    if (Blockly.RTL) {
        cursorX -= diameter;
    }
    this.iconGroup_.setAttribute('transform',
        'translate(' + cursorX + ', ' + TOP_MARGIN + ')');
    this.computeIconLocation();
    if (Blockly.RTL) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
    } else {
        cursorX += diameter + Blockly.BlockSvg.SEP_SPACE_X;
    }
    return cursorX;
};

Blockly.MiniWorkspace.prototype.toggleIcon = function() {
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
        if (!this.block_.isInFlyout) {
            Blockly.addClass_(/** @type {!Element} */ (this.iconGroup_),
                'blocklyIconGroup');
        } else {
            Blockly.removeClass_(/** @type {!Element} */ (this.iconGroup_),
                'blocklyIconGroup');
        }
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
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from scratch.
 */
Blockly.MiniWorkspace.prototype.computeIconLocation = function() {
    // Find coordinates for the centre of the icon and update the arrow.
    var blockXY = this.block_.getRelativeToSurfaceXY();
    var iconXY = Blockly.getRelativeXY_(this.iconGroup_);
    var newX = blockXY.x + iconXY.x + Blockly.Icon.RADIUS;
    var newY = blockXY.y + iconXY.y + Blockly.Icon.RADIUS;
    if (newX !== this.iconX_ || newY !== this.iconY_) {
        this.setIconLocation(newX, newY);
    }
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {number} x Absolute horizontal location.
 * @param {number} y Absolute vertical location.
 */
Blockly.MiniWorkspace.prototype.setIconLocation = function(x, y) {
    this.iconX_ = x;
    this.iconY_ = y;
    if (this.isVisible()) {
        this.bubble_.setAnchorLocation(x, y);
    }
};

/**
 * Is the associated bubble visible?
 * @return {boolean} True if the bubble is visible.
 */
Blockly.MiniWorkspace.prototype.isVisible = function() {
    return !!this.bubble_;
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
