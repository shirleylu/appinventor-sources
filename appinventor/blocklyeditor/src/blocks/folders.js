'use strict';

goog.provide('Blockly.Blocks.folder');

Blockly.Blocks['folder'] = {
    category: "Folders",
    init: function() {
        this.setColour(Blockly.FOLDER_CATEGORY_HUE);
        this.appendDummyInput()
            .appendField("folder"+this.id);
            //.appendField(new Blockly.FieldTextBlockInput('FOLDER NAME'), 'TEXT');
        //this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
        this.setFolderIcon(new Blockly.FolderIcon());
    },
    decompose: function(workspace){
        return Blockly.decompose(workspace,'folder',this);
    },
    compose: Blockly.compose,
    typeblock: [{ translatedName: Blockly.Msg.LANG_FOLDERS_FOLDER }]
};
