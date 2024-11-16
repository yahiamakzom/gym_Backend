const fs = require('fs');
const path = require('path');

function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
 
module.exports =  ensureDirectoryExistence