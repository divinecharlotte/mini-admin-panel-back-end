const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'proto', 'user.proto');
const destDir = path.join(__dirname, 'dist', 'src', 'proto');

// make sure dist/src/proto exists
fs.mkdirSync(destDir, { recursive: true });

// copy the file
fs.copyFileSync(srcPath, path.join(destDir, 'user.proto'));

console.log('✅ user.proto copied to dist folder');
