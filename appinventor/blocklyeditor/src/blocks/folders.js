'use strict';

goog.provide('Blockly.Folders.folder');

Blockly.Folders['folder'] = {
    category: "Folders",
    init: function() {
        this.setColour(Blockly.FOLDER_CATEGORY_HUE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextBlockInput('FOLDER NAME'), 'TEXT');
    },
    typeblock: [{ translatedName: Blockly.Msg.LANG_FOLDERS_FOLDER }]
};
