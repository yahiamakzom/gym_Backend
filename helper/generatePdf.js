const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ensureDirectoryExistence = require('./createIfNotExist'); // Ensure this file exists and works correctly

function generatePDF(data) {
  const dirPath = path.join(__dirname, 'output'); // Define the output directory
  ensureDirectoryExistence(dirPath); // Ensure the directory exists

  const filePath = path.join(dirPath, 'table.pdf'); // Define the PDF file path
  const doc = new PDFDocument({ size: 'A4' }); // Create a new PDF document with A4 size

  doc.pipe(fs.createWriteStream(filePath));

  const backgroundImagePath = path.join(__dirname, 'background-image.png'); // Path to your background image
  doc.image(backgroundImagePath, 0, 0, { width: 595.28, height: 841.89 }); // A4 size in points

  doc.fontSize(20).font('Helvetica-Bold').text('Your Header Here', {
    align: 'center',
    valign: 'center'
  });

  doc.moveDown(2); 

  const tableStartY = doc.y;
  const tableWidth = 500; 
  const tableX = (doc.page.width - tableWidth) / 2; 
  const tableColumnWidth = tableWidth / data[0].length;

  doc.fontSize(12).font('Helvetica-Bold');
  data[0].forEach((header, index) => {
    doc.text(header, tableX + index * tableColumnWidth, tableStartY, { width: tableColumnWidth, align: 'center' });
  });

  doc.moveDown(1); 
  doc.fontSize(10).font('Helvetica');
  data.slice(1).forEach((row, index) => {
    const rowY = doc.y;
    row.forEach((cell, cellIndex) => {
      doc.text(cell, tableX + cellIndex * tableColumnWidth, rowY, { width: tableColumnWidth, align: 'center' });

      doc.strokeColor('black').opacity(0.3).rect(tableX + cellIndex * tableColumnWidth, rowY - 2, tableColumnWidth, 20).stroke();
    });

    doc.moveDown(0.8); 
  });

  doc.strokeColor('black').opacity(0.5).rect(tableX, tableStartY - 2, tableWidth, doc.y - tableStartY).stroke();

  doc.end(); 

  return filePath; 
}

module.exports = generatePDF; // Export the function
