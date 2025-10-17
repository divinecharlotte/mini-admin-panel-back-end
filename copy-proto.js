const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'proto', 'user.proto');
const destDir = path.join(__dirname, 'dist', 'src', 'proto');


fs.mkdirSync(destDir, { recursive: true });


fs.copyFileSync(srcPath, path.join(destDir, 'user.proto'));

console.log('✅ user.proto copied to dist folder');
