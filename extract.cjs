const fs = require('fs');
const html = fs.readFileSync('satualbum.html', 'utf8');

const divRegex = /<div[^>]*class="([^"]*)"[^>]*>/g;
let match;
const classes = new Set();
while ((match = divRegex.exec(html)) !== null) {
  classes.add(match[1]);
}

console.log("Found classes count:", classes.size);
console.log("Classes sample:\n", Array.from(classes).join('\n'));
