'use strict';
goog.require('goog.asserts');

goog.provide('Blockly.Folders');
/**
 * 
 * @param details
 */
Blockly.Folders.addTemplate = function(details) {
    // Validate inputs.  TODO: Add more.
    goog.asserts.assert(details.blockName);
    goog.asserts.assert(Blockly.Folders[details.blockName],
        'Blockly.Folders already has a field named ', details.blockName);
    goog.asserts.assert(details.message);
    goog.asserts.assert(details.colour && typeof details.colour == 'number' &&
        details.colour >= 0 && details.colour < 360,
        'details.colour must be a number from 0 to 360 (exclusive)');
    if (details.output != 'undefined') {
        goog.asserts.assert(!details.previousStatement,
            'When details.output is defined, ' +
            'details.previousStatement must not be true.');
        goog.asserts.assert(!details.nextStatement,
            'When details.output is defined, ' +
            'details.nextStatement must not be true.');
    }

    var folder = {};
    /**
     * Build up template.
     * @this Blockly.Folder
     */
    folder.init = function() {
        var thisFolder = this;
        // Set basic properties of folder.
        this.setColour(details.colour);
        this.setHelpUrl(details.helpUrl);
        if (typeof details.tooltip == 'string') {
            this.setTooltip(details.tooltip);
        } else if (typeof details.tooltip == 'function') {
            this.setTooltip(function() {
                return details.tooltip(thisFolder);
            });
        }
        // Set output and previous/next connections.
        if (details.output != 'undefined') {
            this.setOutput(true, details.output);
        } else {
            this.setPreviousStatement(
                typeof details.previousStatement == 'undefined' ?
                    true : details.previousStatement);
            this.setNextStatement(
                typeof details.nextStatement == 'undefined' ?
                    true : details.nextStatement);
        }
        // Build up arguments in the format expected by interpolateMsg.
        var interpArgs = [];
        interpArgs.push(details.text);
        if (details.args) {
            details.args.forEach(function(arg) {
                goog.asserts.assert(arg.name);
                goog.asserts.assert(arg.check != 'undefined');
                if (arg.type == 'undefined' || arg.type == Blockly.INPUT_VALUE) {
                    interpArgs.push([arg.name,
                        arg.check,
                        typeof arg.align == 'undefined' ? Blockly.ALIGN_RIGHT
                            : arg.align]);
                } else {
                    // TODO: Write code for other input types.
                    goog.asserts.fail('addTemplate() can only handle value inputs.');
                }
            });
        }
        // Neil, how would you recommend specifying the final dummy alignment?
        // Should it be a top-level field in details?
        interpArgs.push(Blockly.ALIGN_RIGHT);
        if (details.inline) {
            this.setInlineInputs(details.inline);
        }
        Blockly.Folder.prototype.interpolateMsg.apply(this, interpArgs);
    };

    if (details.switchable) {
        /**
         * Create mutationToDom if needed.
         * @this Blockly.Folder
         */
        folder.mutationToDom = function() {
            var container = details.mutationToDomFunc ? details.mutatationToDomFunc()
                : document.createElement('mutation');
            container.setAttribute('is_statement', this['isStatement'] || false);
            return container;
        };
    } else {
        folder.mutationToDom = details.mutationToDomFunc;
    }
    // TODO: Add domToMutation and customContextMenu.

    // Add new folder to Blockly.Folders.
    Blockly.Folders[details.blockName] = folder;
};
