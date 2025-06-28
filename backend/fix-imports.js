// Add .js extensions to import statements for ESM compatibility
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all .ts files in the src directory
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.endsWith('.test.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Match import statements with relative paths but no file extension
  // Regex explained: 
  // - Match 'import' or 'export' keyword
  // - Followed by anything (non-greedy)
  // - Followed by 'from'
  // - Followed by a string with a relative path ('./' or '../') but no file extension
  const importRegex = /(import|export)(.+?)from\s+['"]([.][.\/][^'"]+)(?!\.js)['"];?/g;
  
  // Replace matched imports to add .js extension
  content = content.replace(importRegex, (match, importExport, middle, path) => {
    return `${importExport}${middle}from '${path}.js';`;
  });
  
  fs.writeFileSync(filePath, content);
  return content !== fs.readFileSync(filePath, 'utf-8'); // Return true if file was modified
}

// Main execution
const srcDir = path.resolve(__dirname, 'src');
const tsFiles = getAllTsFiles(srcDir);
console.log(`Found ${tsFiles.length} TypeScript files to process`);

let modifiedCount = 0;
tsFiles.forEach(file => {
  const wasModified = fixImportsInFile(file);
  if (wasModified) modifiedCount++;
});

console.log(`Modified ${modifiedCount} files`);
