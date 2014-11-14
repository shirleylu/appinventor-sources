'use strict';

goog.provide('Blockly.Blocks.folder');

Blockly.Blocks['folder'] = {
    category: "Folders",
    init: function() {
        this.setColour(Blockly.FOLDER_CATEGORY_HUES);
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextBlockInput('FOLDER NAME'), 'TEXT');
    },
    typeblock: [{ translatedName: Blockly.Msg.LANG_FOLDERS_FOLDER }]
};
