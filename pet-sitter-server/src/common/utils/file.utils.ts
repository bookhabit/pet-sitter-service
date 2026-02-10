/**
 * Base64 인코딩된 파일 데이터를 Express.Multer.File 객체로 변환합니다.
 * GraphQL 리졸버에서 파일 업로드를 처리할 때 사용합니다.
 */
export function base64ToMulterFile(
  base64: string,
  originalName: string,
  mimeType: string,
): Express.Multer.File {
  const buffer = Buffer.from(base64, 'base64');
  return {
    fieldname: 'file',
    originalname: originalName,
    encoding: '7bit',
    mimetype: mimeType,
    buffer,
    size: buffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };
}
