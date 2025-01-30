const fs = require('fs');
const path = require('path'); // Import the `path` module
const ExcelJS = require('exceljs');
const ensureDirectoryExistence = require('./createIfNotExist'); // Ensure this file exists and works correctly

async function generateExcel(data) {
  const dirPath = path.join(__dirname, 'output'); // Define the directory path
  ensureDirectoryExistence(dirPath); // Ensure the directory exists

  const filePath = path.join(dirPath, 'table.xlsx'); // Define the file path
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  const columns = data[0].map((header) => ({
    header: header,
    key: header.toLowerCase(), 
    width: 20 
  })); 

  worksheet.columns = columns;

  data.slice(1).forEach((row) => {
    const rowData = row.reduce((acc, cell, index) => {
      const header = data[0][index].toLowerCase(); 
      acc[header] = cell; 
      return acc;
    }, {});

    worksheet.addRow(rowData);
  });

  await workbook.xlsx.writeFile(filePath); // Write the Excel file
  return filePath; // Return the file path
}

module.exports = generateExcel;
