// FARM SHOP - GOOGLE APPS SCRIPT
// Copy this entire code into your Google Sheet's Apps Script editor

// STEP 1: Get your Google Sheet ID
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual Sheet ID

// STEP 2: Deploy as Web App
// 1. Click "Deploy" → "New deployment"
// 2. Type: "Web app"
// 3. Description: "Farm Shop API"
// 4. Execute as: "Me"
// 5. Who has access: "Anyone"
// 6. Click "Deploy"
// 7. Copy the Web App URL

function doGet(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  
  if (action === 'read') {
    return readSheet(ss, sheet);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const sheet = data.sheet;
  
  if (action === 'write') {
    return writeSheet(ss, sheet, data.rows);
  } else if (action === 'append') {
    return appendSheet(ss, sheet, data.row);
  } else if (action === 'update') {
    return updateSheet(ss, sheet, data.row, data.rowIndex);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Read all data from a sheet
function readSheet(ss, sheetName) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: rows
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Write entire sheet (replace all data)
function writeSheet(ss, sheetName, rows) {
  try {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    sheet.clear();
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const values = [headers, ...rows.map(row => headers.map(h => row[h] || ''))];
      sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data written successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Append a single row to sheet
function appendSheet(ss, sheetName, row) {
  try {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = Object.keys(row);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = headers.map(h => row[h] || '');
    sheet.appendRow(values);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Row appended successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Update a specific row
function updateSheet(ss, sheetName, row, rowIndex) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = headers.map(h => row[h] || '');
    sheet.getRange(rowIndex + 2, 1, 1, values.length).setValues([values]); // +2 because headers are row 1, and array is 0-indexed
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Row updated successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get next ID for a sheet
function getNextId(ss, sheetName, idColumn) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() <= 1) {
      return 1;
    }
    
    const data = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getValues();
    const ids = data.map(row => parseInt(row[0]) || 0);
    return Math.max(...ids) + 1;
  } catch (error) {
    return 1;
  }
}
