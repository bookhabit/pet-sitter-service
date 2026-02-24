const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/design-system/icons/components');
const indexFile = path.join(__dirname, '../src/design-system/icons/index.ts');

const files = fs
  .readdirSync(componentsDir)
  .filter((file) => file.endsWith('.tsx') && file !== 'index.ts')
  .map((file) => file.replace('.tsx', ''));

const content = `// ⚠️ 자동 생성된 파일입니다. 수정하지 마세요.
export * from './types.ts';
${files.map((name) => `export { default as ${name}Icon } from './components/${name}';`).join('\n')}
`;

fs.writeFileSync(indexFile, content);
console.log('✅ Icons index generated with "Icon" suffix!');
