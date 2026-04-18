const fs = require('fs');
const content = fs.readFileSync('src/components/SlimDayApp.tsx', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let closeBraces = 0;
let inSlimDayApp = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('function SlimDayApp() {')) {
        inSlimDayApp = true;
    }
    
    if (inSlimDayApp) {
        openBraces += (line.match(/{/g) || []).length;
        closeBraces += (line.match(/}/g) || []).length;
    }
}

console.log(`Open: ${openBraces}, Close: ${closeBraces}`);
console.log(`Balance: ${openBraces - closeBraces}`);
