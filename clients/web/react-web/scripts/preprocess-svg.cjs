const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../src/design-system/icons/assets');

const preprocess = () => {
  const files = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.svg'));

  files.forEach((file) => {
    const filePath = path.join(assetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. fill="색상코드" -> fill="currentColor" (none은 제외)
    content = content.replace(/fill="(?!none|white)[^"]+"/g, 'fill="currentColor"');

    // 2. stroke="색상코드" -> stroke="currentColor" (none은 제외)
    content = content.replace(/stroke="(?!none|white)[^"]+"/g, 'stroke="currentColor"');

    fs.writeFileSync(filePath, content);
  });

  console.log('✨ SVG files preprocessed to use currentColor!');
};

preprocess();
