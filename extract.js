const fs = require('fs');
const html = fs.readFileSync('satualbum.html', 'utf8');

// Find all HTML elements and text snippets in satualbum.html
console.log("HTML length:", html.length);

// Extract text content and structure
const divRegex = /<div[^>]*class="([^"]*)"[^>]*>/g;
let match;
const classes = new Set();
while ((match = divRegex.exec(html)) !== null) {
  classes.add(match[1]);
}

console.log("Found classes count:", classes.size);
console.log("Classes sample:", Array.from(classes).slice(0, 20));
