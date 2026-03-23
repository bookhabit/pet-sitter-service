/**
 * 아이콘 index.ts 자동 생성 스크립트
 *
 * icons:build (SVGR) 실행 후 components/ 폴더를 읽어 index.ts 를 재생성합니다.
 * 직접 편집하지 마세요 — npm run icons 를 통해 갱신됩니다.
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../src/design-system/icons');
const COMPONENTS_DIR = path.join(ICONS_DIR, 'components');
const INDEX_FILE = path.join(ICONS_DIR, 'index.ts');

/* components/ 폴더에서 .tsx 파일 목록 수집 (알파벳 순) */
const files = fs
  .readdirSync(COMPONENTS_DIR)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => file.replace('.tsx', ''))
  .sort();

if (files.length === 0) {
  console.warn('⚠️  components/ 폴더가 비어 있습니다. npm run icons:build 를 먼저 실행하세요.');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

const content = [
  `// ⚠️ 자동 생성된 파일입니다. 수동으로 수정하지 마세요!`,
  `// 생성일시: ${timestamp}`,
  `// 재생성: npm run icons`,
  ``,
  `export * from './types';`,
  ``,
  ...files.map((name) => `export * from './components/${name}';`),
  ``,
].join('\n');

fs.writeFileSync(INDEX_FILE, content, 'utf-8');
console.log(`✅ icons/index.ts 재생성 완료 (${files.length}개 아이콘: ${files.join(', ')})`);
