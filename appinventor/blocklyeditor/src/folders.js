/** For the most part, based on variables.js **/

'use strict';

goog.provide('Blockly.Folders');


Blockly.Folders.NAME_TYPE = 'FOLDER';
//
/////**
//// * Find all user-created variables.
//// * @param {Blockly.Block=} opt_block Optional root block.
//// * @return {!Array.<string>} Array of variable names.
//// */
////Blockly.Variables.allVariables = function(opt_block) {
////    var blocks;
////    if (opt_block) {
////        blocks = opt_block.getDescendants();
////    } else {
////        blocks = Blockly.mainWorkspace.getAllBlocks();
////    }
////    var variableHash = Object.create(null);
////    // Iterate through every block and add each variable to the hash.
////    for (var x = 0; x < blocks.length; x++) {
////        var func = blocks[x].getVars;
////        if (func) {
////            var blockVariables = func.call(blocks[x]);
////            for (var y = 0; y < blockVariables.length; y++) {
////                var varName = blockVariables[y];
////                // Variable name may be null if the block is only half-built.
////                if (varName) {
////                    variableHash[varName.toLowerCase()] = varName;
////                }
////            }
////        }
////    }
////    // Flatten the hash into a list.
////    var variableList = [];
////    for (var name in variableHash) {
////        variableList.push(variableHash[name]);
////    }
////    return variableList;
////};
//
///**
// * Find all instances of the specified variable and rename them.
// * @param {string} oldName Variable to rename.
// * @param {string} newName New variable name.
// */
//Blockly.Folders.renameFolder = function(oldName, newName) {
//    //var blocks = Blockly.mainWorkspace.getAllBlocks();
//    //// Iterate through every block.
//    //for (var x = 0; x < blocks.length; x++) {
//    //    var func = blocks[x].renameVar;
//    //    if (func) {
//    //        func.call(blocks[x], oldName, newName);
//    //    }
//    //}
//
//    //TODO - need a way to save all folders
//};
//
///**
// * Construct the blocks required by the flyout for the variable category.
// * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
// * @param {!Array.<number>} gaps List of widths between blocks.
// * @param {number} margin Standard margin width for calculating gaps.
// * @param {!Blockly.Workspace} workspace The flyout's workspace.
// */
//Blockly.Folders.flyoutCategory = function(blocks, gaps, margin, workspace) {
//    //var variableList = Blockly.Variables.allVariables();
//    //variableList.sort(goog.string.caseInsensitiveCompare);
//    //// In addition to the user's variables, we also want to display the default
//    //// variable name at the top.  We also don't want this duplicated if the
//    //// user has created a variable of the same name.
//    //variableList.unshift(null);
//    //var defaultVariable = undefined;
//    //for (var i = 0; i < variableList.length; i++) {
//    //    if (variableList[i] === defaultVariable) {
//    //        continue;
//    //    }
//    //    var getBlock = Blockly.Blocks['variables_get'] ?
//    //        Blockly.Block.obtain(workspace, 'variables_get') : null;
//    //    getBlock && getBlock.initSvg();
//    //    var setBlock = Blockly.Blocks['variables_set'] ?
//    //        Blockly.Block.obtain(workspace, 'variables_set') : null;
//    //    setBlock && setBlock.initSvg();
//    //    if (variableList[i] === null) {
//    //        defaultVariable = (getBlock || setBlock).getVars()[0];
//    //    } else {
//    //        getBlock && getBlock.setFieldValue(variableList[i], 'VAR');
//    //        setBlock && setBlock.setFieldValue(variableList[i], 'VAR');
//    //    }
//    //    setBlock && blocks.push(setBlock);
//    //    getBlock && blocks.push(getBlock);
//    //    if (getBlock && setBlock) {
//    //        gaps.push(margin, margin * 3);
//    //    } else {
//    //        gaps.push(margin * 2);
//    //    }
//    //}
//    /** TODO - this not so much needs to get all variables to display but to actually send the flyout to a Folders generator
//     * not a blocks generator.
//     **/
//};
//
///**
// * Return a new variable name that is not yet being used. This will try to
// * generate single letter variable names in the range 'i' to 'z' to start with.
// * If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
// * @return {string} New variable name.
// */
//Blockly.Folders.generateUniqueName = function() {
//    //var variableList = Blockly.Variables.allVariables();
//    //var newName = '';
//    //if (variableList.length) {
//    //    variableList.sort(goog.string.caseInsensitiveCompare);
//    //    var nameSuffix = 0, potName = 'i', i = 0, inUse = false;
//    //    while (!newName) {
//    //        i = 0;
//    //        inUse = false;
//    //        while (i < variableList.length && !inUse) {
//    //            if (variableList[i].toLowerCase() == potName) {
//    //                // This potential name is already used.
//    //                inUse = true;
//    //            }
//    //            i++;
//    //        }
//    //        if (inUse) {
//    //            // Try the next potential name.
//    //            if (potName[0] === 'z') {
//    //                // Reached the end of the character sequence so back to 'a' but with
//    //                // a new suffix.
//    //                nameSuffix++;
//    //                potName = 'a';
//    //            } else {
//    //                potName = String.fromCharCode(potName.charCodeAt(0) + 1);
//    //                if (potName[0] == 'l') {
//    //                    // Avoid using variable 'l' because of ambiguity with '1'.
//    //                    potName = String.fromCharCode(potName.charCodeAt(0) + 1);
//    //                }
//    //            }
//    //            if (nameSuffix > 0) {
//    //                potName += nameSuffix;
//    //            }
//    //        } else {
//    //            // We can use the current potential name.
//    //            newName = potName;
//    //        }
//    //    }
//    //} else {
//    //    newName = 'i';
//    //}
//    //return newName;
//};
