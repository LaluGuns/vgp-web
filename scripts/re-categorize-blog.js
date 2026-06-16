const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../lib/blog-posts');

function getNewCategory(id) {
    if (id >= 1 && id <= 10) return 'songwriting';
    if (id >= 11 && id <= 30) return 'arrangement-groove';
    if (id >= 31 && id <= 40) return 'sound-design';
    if (id >= 41 && id <= 50) return 'vocal-production';
    if (id >= 51 && id <= 70) return 'mixing-mastering';
    if (id >= 71 && id <= 90) return 'producer-psychology';
    if (id >= 91 && id <= 100) return 'audio-science';
    return null;
}

if (!fs.existsSync(postsDir)) {
    console.error('Directory does not exist:', postsDir);
    process.exit(1);
}

const files = fs.readdirSync(postsDir);
let count = 0;

files.forEach((file) => {
    if (!file.endsWith('.ts') || file === 'index.ts') return;
    
    const idMatch = file.match(/^(\d+)-/);
    if (!idMatch) return;
    
    const id = parseInt(idMatch[1], 10);
    const newCategory = getNewCategory(id);
    if (!newCategory) return;
    
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace category: 'production-tips' with category: 'new-category'
    const originalRegex = /category:\s*['"]production-tips['"]/g;
    if (content.match(originalRegex)) {
        content = content.replace(originalRegex, `category: '${newCategory}'`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file} to category '${newCategory}'`);
        count++;
    }
});

console.log(`Successfully updated categories for ${count} files.`);
