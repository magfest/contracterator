// home: https://github.com/magfest/contracterator/

// the spreadsheet where we read the data FROM
var SOURCE_DATA_SHEET_ID = "";

// the google doc we read in and substitute :variables: from
var SOURCE_DOCUMENT_TEMPLATE = "";

function getRowAsArray(sheet, row) {
  var dataRange = sheet.getRange(row, 1, 1, 99);
  var data = dataRange.getValues();
  var columns = [];

  for (i in data) {
    var row = data[i];

    // Logger.log("Got row", row);

    for(var l=0; l<99; l++) {
        var col = row[l];
        // First empty column interrupts
        if(!col) {
            break;
        }

        columns.push(col);
    }
  }

  return columns;
}


// read the first row of the spreadsheet which will contain the variable names like :PerformerName: etc
function readVariableNamesFromSheet(sheet) {
  var variable_names = getRowAsArray(sheet, 1);
  Logger.log("Found variables:" + variable_names);
  return variable_names;
}

function readAllVariableValuesFromSheet(sheet) {
  
  values = []
  
  // skip the header row
  var current_row_index = 2;
  
  // loop until we find a row with no data, or a row with a blank first column
  while (true) {
    var row = getRowAsArray(sheet, current_row_index);
    
    if (row.length == 0 || row[0] == "")
      break;
    
    Logger.log("reading in row: " + row)
    
    values.push(row);
    
    current_row_index++;
  }
  
  return values;
}

function buildAssocArrayFromRawData(variable_names, variable_values) {
  var data = {};
  for (var i = 0; i < variable_names.length; ++i) {
    data[variable_names[i]] = variable_values[i];
  }
  return data;
}

function readVariablesFromSpreadsheet(sheet_id) {
  var variable_names = readVariableNamesFromSheet(sheet_id);
  var variable_values = readAllVariableValuesFromSheet(sheet_id);
  
  // convert each row into an associative array, so we can do stuff like data["PerformerName"]
  var data = [];
  for (var i = 0; i < variable_values.length; ++i) {
    data.push(buildAssocArrayFromRawData(variable_names, variable_values[i]));
  }
  
  return data;
}

/**
 * Duplicates a Google Apps doc
 *
 * @return a new document with a given name from the orignal
 */
function createDuplicateDocument(sourceId, name, target_folder_name) {
  var source = DriveApp.getFileById(sourceId);
  
  var targetFolder = null;
  var createFolder = false;
  try {
    targetFolder = DriveApp.getFoldersByName(target_folder_name).next();
  } catch (e) {
    createFolder = true;
  }
  
  if (!targetFolder || createFolder) {
    targetFolder = DriveApp.createFolder(target_folder_name);
  }
  
  var newFile = source.makeCopy(name, targetFolder);
  
  return DocumentApp.openById(newFile.getId());
}

/**
 * Search a String in the document and replaces it with the generated newString, and sets it Bold
 */
function replaceString(doc, string_to_find, string_to_replace_with) {
  var paragraphs = doc.getParagraphs();
  for(var i = 0; i < paragraphs.length; ++i) {
    var p = paragraphs[i];
    var text = p.getText();

    if(text.indexOf(string_to_find) < 0) {
      continue;
    }
    
    //look if the String is present in the current paragraph
    p.editAsText().replaceText(string_to_find, string_to_replace_with);
    
    // we calculte the length of the string to modify, making sure that is treated like a string and not another kind of object.
    var newStringLength = string_to_replace_with.toString().length;
    
    // if a string has been replaced with a NON empty space, set the new string to Bold, 
    if (newStringLength > 0) {
      // re-populate the text variable with the updated content of the paragraph
      text = p.getText();
      p.editAsText().setBold(text.indexOf(string_to_replace_with), text.indexOf(string_to_replace_with) + newStringLength - 1, true);
    }
  }
}

function substituteVariableStrings(target, variables) {
  for (var key in variables) {
    var string_to_find = ":" + key + ":";
    var text_to_replace_with = variables[key];
    replaceString(target, string_to_find, text_to_replace_with);
  }
}

function createDocumentFromTemplate(source_template_id, variables, config) {
  if (variables.ShouldGenerate != "yes") {
    Logger.log("skipping row because ShouldGenerate is not 'yes'")
    return;
  }
  
  var new_name = config["NewDocsBaseName"] + variables[config["NewDocsTitleColumn"]];
  
  Logger.log(new_name);
  
  var target = createDuplicateDocument(source_template_id, new_name, config["OutputFolder"]);
  
  substituteVariableStrings(target, variables);
}

function generateAllContracts() {
  var source_data_sheet = SpreadsheetApp.openById(SOURCE_DATA_SHEET_ID);
    
  // TODO: use the sheet name instead of relying on the index for getSheets()
  var data = readVariablesFromSpreadsheet(source_data_sheet.getSheets()["0"]);
  var config = readVariablesFromSpreadsheet(source_data_sheet.getSheets()["1"])[0];
  
  Logger.log("found data = " + data);
  Logger.log("found config = " + config);
   
  // data.forEach(function (document_variables) {
  for (document_variables in data) {
    createDocumentFromTemplate(SOURCE_DOCUMENT_TEMPLATE, data[document_variables], config);
  }
}
