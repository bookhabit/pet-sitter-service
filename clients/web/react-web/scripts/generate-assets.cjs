const fs = require('fs');
const path = require('path');

// 1. 경로 설정 (현진 님의 구조에 맞춤)
const imageDir = path.join(__dirname, '../src/design-system/images/assets');
const outputFile = path.join(__dirname, '../src/design-system/images/index.ts');

// 2. 이미지 파일 필터링
const files = fs.readdirSync(imageDir).filter((file) => /\.(png|jpe?g|svg|webp|gif)$/i.test(file));

// 3. 변수명 변환 (예: default-thumb.png -> DEFAULT_THUMB)
const formatKey = (filename) => {
  const name = path.parse(filename).name;
  return name.replace(/[- ]/g, '_').toUpperCase();
};

// 4. 내용 생성 (Vite 환경에 맞게 import 문 사용)
const importStatements = files
  .map((file) => `import ${formatKey(file)} from './assets/${file}';`)
  .join('\n');

const assetEntries = files.map((file) => `  ${formatKey(file)},`).join('\n');

const content = `// ⚠️ 자동 생성된 파일입니다. 수동으로 수정하지 마세요.
${importStatements}

export const ASSETS = {
${assetEntries}
} as const;

export type AssetKey = keyof typeof ASSETS;
`;

// 5. 파일 쓰기
fs.writeFileSync(outputFile, content, 'utf8');

console.log(`✅ ${files.length}개의 이미지가 ASSETS 객체로 통합되었습니다!`);
