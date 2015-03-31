'use strict';

goog.provide('Blockly.MiniWorkspace');
goog.require('Blockly.Workspace');
goog.require('Blockly.ScrollbarPair');


/**
 * Class for a mini workspace. 
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.MiniWorkspace = function(folder,getMetrics,setMetrics) {
    Blockly.MiniWorkspace.superClass_.constructor.call(this, getMetrics, setMetrics);
    //this.getMetrics = getMetrics;
    //this.setMetrics = setMetrics;

    this.block_ = folder;
    this.topBlocks_ = [];
    this.maxBlocks = Infinity;
    this.svgGroup_ = null;
    this.svgBlockCanvas_ = null;
    this.svgBubbleCanvas_ = null;
    this.svgGroupBack_ = null;
    this.isMW = true;
};

goog.inherits(Blockly.MiniWorkspace, Blockly.Workspace);

Blockly.MiniWorkspace.prototype.rendered_ = false;
Blockly.MiniWorkspace.prototype.scrollbar_ = true;

Blockly.MiniWorkspace.prototype.anchorX_ = 0;
Blockly.MiniWorkspace.prototype.anchorY_ = 0;

Blockly.MiniWorkspace.prototype.relativeLeft_ = 0;
Blockly.MiniWorkspace.prototype.relativeTop_ = 0;
Blockly.MiniWorkspace.prototype.relativeLeft_ = 0;

Blockly.MiniWorkspace.prototype.width_ = 0;
Blockly.MiniWorkspace.prototype.height_ = 0;

Blockly.MiniWorkspace.prototype.autoLayout_ = true;

Blockly.MiniWorkspace.getWorkspaceMetrics_ = function () {
    var svgSize = Blockly.svgSize();
    console.log(svgSize);
    //the workspace is just a percentage though.
    svgSize.width *= 0.4;
    svgSize.height *= 0.7;
    console.log(svgSize);

    //We don't use Blockly.Toolbox in our version of Blockly instead we use drawer.js
    //svgSize.width -= Blockly.Toolbox.width;  // Zero if no Toolbox.
    svgSize.width -= 0;  // Zero if no Toolbox.
    var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
    var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
    try {
        var blockBox = this.getCanvas().getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        return null;
    }
    console.log(blockBox);
    if (this.scrollbar_) {
        // Add a border around the content that is at least half a screenful wide.
        // Ensure border is wide enough that blocks can scroll over entire screen.
        var leftEdge = Math.min(blockBox.x - viewWidth / 2,
            blockBox.x + blockBox.width - viewWidth);
        var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
            blockBox.x + viewWidth);
        var topEdge = Math.min(blockBox.y - viewHeight / 2,
            blockBox.y + blockBox.height - viewHeight);
        var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
            blockBox.y + viewHeight);
    } else {
        var leftEdge = blockBox.x;
        var rightEdge = leftEdge + blockBox.width;
        var topEdge = blockBox.y;
        var bottomEdge = topEdge + blockBox.height;
    }
    //We don't use Blockly.Toolbox in our version of Blockly instead we use drawer.js
    //var absoluteLeft = Blockly.RTL ? 0 : Blockly.Toolbox.width;
    var absoluteLeft = Blockly.RTL ? 0 : 0;
    var metrics = {
        viewHeight: svgSize.height,
        viewWidth: svgSize.width,
        contentHeight: bottomEdge - topEdge,
        contentWidth: rightEdge - leftEdge,
        viewTop: -this.scrollY,
        viewLeft: -this.scrollX,
        contentTop: topEdge,
        contentLeft: leftEdge,
        absoluteTop: 0,
        absoluteLeft: absoluteLeft
    };
    return metrics;
};

Blockly.MiniWorkspace.setWorkspaceMetrics_ = function(xyRatio) {
    if (!this.scrollbar) {
        throw 'Attempt to set mini workspace scroll without scrollbars.';
    }
    var metrics = Blockly.MiniWorkspace.getWorkspaceMetrics_();
    if (goog.isNumber(xyRatio.x)) {
        this.scrollX = -metrics.contentWidth * xyRatio.x -
        metrics.contentLeft;
    }
    if (goog.isNumber(xyRatio.y)) {
        this.scrollY = -metrics.contentHeight * xyRatio.y -
        metrics.contentTop;
    }
    var translation = 'translate(' +
        (this.scrollX + metrics.absoluteLeft) + ',' +
        (this.scrollY + metrics.absoluteTop) + ')';
    this.getCanvas().setAttribute('transform', translation);
    this.getBubbleCanvas().setAttribute('transform',
        translation);
};

//TODO
Blockly.MiniWorkspace.prototype.renderWorkspace = function (folder, anchorX, anchorY) {
    this.createDom();

    this.workspace_ = folder.workspace;
    this.shape_ = folder.svg_.svgPath_;
    var canvas = this.workspace_.getCanvas();
    canvas.appendChild(this.createDom_());

    this.setAnchorLocation(anchorX, anchorY);
    //Set MW  Size
    try {
        var bBox = /** @type {SVGLocatable} */ (this.svgBlockCanvas_).getBBox();
    } catch (e) {
        // Firefox has trouble with hidden elements (Bug 528969).
        var bBox = {height: 0, width: 0};
    }
    this.width_ = bBox.width + 2 * Blockly.Bubble.BORDER_WIDTH;
    this.height_ = bBox.height + 2 * Blockly.Bubble.BORDER_WIDTH;
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    this.width_ = Math.max(this.width_, doubleBorderWidth + 45);
    this.height_ = Math.max(this.height_, 30 + Blockly.BlockSvg.FIELD_HEIGHT);
    this.svgGroupBack_.setAttribute('width',this.width_);
    this.svgGroupBack_.setAttribute('height',this.height_+20);
    this.svgGroupBack_.setAttribute('transform','translate(-5,-5)');
    this.svgGroup_.setAttribute('width',this.width_);
    this.svgTitle_.setAttribute('transform','translate(10,'+(this.height_+5)+')');


    Blockly.fireUiEvent(this.svgGroup_,'resize');

    this.positionMiniWorkspace_ ();
    this.rendered_ = true;
    this.scrollbar = new Blockly.ScrollbarPair(this);
    //this.scrollbar.resize();

    //render topBlocks_
    var topBlocks = this.getTopBlocks();
    this.topBlocks_ = [];
    for (var x = 0, b; b = topBlocks[x]; x++) {
        var dom = Blockly.Xml.blockToDom_(b);
        var bl = Blockly.Xml.domToBlock(this,dom);
        bl.IsInFolder = true;
    }
    this.fireChangeEvent();

    if (!Blockly.readOnly) {
        Blockly.bindEvent_(this.svgGroupBack_, 'mousedown', this,
            this.miniWorkspaceMouseDown_);
    }
};

//TODO
Blockly.MiniWorkspace.prototype.disposeWorkspace = function () {
    Blockly.MiniWorkspace.unbindDragEvents_();
    // Dispose of and unlink the bubble.
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
    this.svgBlockCanvas_ = null;
    this.svgBubbleCanvas_ = null;
    this.svgGroupBack_ = null;
    this.workspace_ = null;
    this.content_ = null;
    this.shape_ = null;

    for (var t = 0, block; block = this.topBlocks_[t]; t++) {
        block.rendered = false;
    }
};

//MiniWorkspace cannot be resized - this can change in the future
Blockly.MiniWorkspace.prototype.createDom_ = function () {
    this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
    var svgGroupEmboss = Blockly.createSvgElement('g',
        {'filter': 'url(#blocklyEmboss)'}, this.svgGroup_);

    this.svgBlockCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    Blockly.bindEvent_(this.svgBlockCanvas_, 'mousedown', this.svgBlockCanvas_,
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

    Blockly.createSvgElement('rect',
        {'class': 'blocklyMutatorBackground',
            'height': '70%', 'width': '40%'}, this.svgBlockCanvas_);

    this.svgBubbleCanvas_ = Blockly.createSvgElement('g', {}, this.svgGroup_);
    this.svgGroupBack_ = Blockly.createSvgElement('rect',
        {'class': 'blocklyDraggable', 'x': 0, 'y': 0,
            'rx': Blockly.Bubble.BORDER_WIDTH, 'ry': Blockly.Bubble.BORDER_WIDTH},
        svgGroupEmboss);
    this.svgTitle_ = Blockly.createSvgElement('text',{
        'class':'blocklyText'},this.svgGroup_);
    this.svgTitle_.innerHTML="Folder"+this.block_.id;
    this.resizeGroup_ = null;
    //this.svgBlockCanvas_.appendChild(content);

    //this.svgGroup_.appendChild(content);

    return this.svgGroup_;
};

Blockly.MiniWorkspace.prototype.addTopBlock = function(block) {
    block.workspace == this;
    block.isInFolder = true;
    this.topBlocks_.push(block);
    if (Blockly.Realtime.isEnabled() && this == Blockly.mainWorkspace) {
        Blockly.Realtime.addTopBlock(block);
    }
    this.fireChangeEvent();
};

Blockly.MiniWorkspace.prototype.setAnchorLocation = function (x,y) {
    this.anchorX_ = x;
    this.anchorY_ = y;
    if (this.rendered_) {
        this.positionMiniWorkspace_();
    }
};

Blockly.MiniWorkspace.prototype.positionMiniWorkspace_ = function () {
    var left;
    if (Blockly.RTL) {
        left = this.anchorX_ - this.relativeLeft_ - this.width_;
    } else {
        left = this.anchorX_ + this.relativeLeft_;
    }
    var top = this.relativeTop_ + this.anchorY_;
    this.svgGroup_.setAttribute('transform',
        'translate(' + left + ', ' + top + ')');
};

Blockly.MiniWorkspace.prototype.miniWorkspaceMouseDown_ = function (e) {
    this.promote_();
    Blockly.MiniWorkspace.unbindDragEvents_();
    if (Blockly.isRightButton(e)) {
        // Right-click.
        return;
    } else if (Blockly.isTargetInput_(e)) {
        // When focused on an HTML text input widget, don't trap any events.
        return;
    }
    // Left-click (or middle click)
    Blockly.setCursorHand_(true);
    // Record the starting offset between the current location and the mouse.
    if (Blockly.RTL) {
        this.dragDeltaX =  this.relativeLeft_ + e.clientX;
    } else {
        this.dragDeltaX = this.relativeLeft_ - e.clientX;
    }
    this.dragDeltaY = this.relativeTop_ - e.clientY;

    Blockly.MiniWorkspace.onMouseUpWrapper_ = Blockly.bindEvent_(document,
        'mouseup', this, Blockly.MiniWorkspace.unbindDragEvents_);
    Blockly.MiniWorkspace.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
        'mousemove', this, this.MiniWorkspaceMouseMove_);
    Blockly.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
};

Blockly.MiniWorkspace.unbindDragEvents_ = function() {
    if (Blockly.MiniWorkspace.onMouseUpWrapper_) {
        Blockly.unbindEvent_(Blockly.MiniWorkspace.onMouseUpWrapper_);
        Blockly.MiniWorkspace.onMouseUpWrapper_ = null;
    }
    if (Blockly.MiniWorkspace.onMouseMoveWrapper_) {
        Blockly.unbindEvent_(Blockly.MiniWorkspace.onMouseMoveWrapper_);
        Blockly.MiniWorkspace.onMouseMoveWrapper_ = null;
    }
};

Blockly.MiniWorkspace.prototype.MiniWorkspaceMouseMove_ = function(e) {
    this.autoLayout_ = false;
    if (Blockly.RTL) {
        this.relativeLeft_ = this.dragDeltaX - e.clientX;
    } else {
        this.relativeLeft_ = this.dragDeltaX + e.clientX;
    }
    this.relativeTop_ = this.dragDeltaY + e.clientY;
    this.positionMiniWorkspace_();
};

Blockly.MiniWorkspace.prototype.promote_ = function() {
    var svgGroup = this.svgGroup_.parentNode;
    svgGroup.appendChild(this.svgGroup_);
    this.block_.promote();
};