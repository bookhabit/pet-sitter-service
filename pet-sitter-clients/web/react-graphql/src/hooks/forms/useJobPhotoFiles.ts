import { useEffect, useMemo, useState } from 'react';

export const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function filterBySize(files: File[]): { valid: File[]; rejectedCount: number } {
  const valid = files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
  return { valid, rejectedCount: files.length - valid.length };
}

function sizeErrorMessage(rejectedCount: number): string | null {
  if (rejectedCount === 0) return null;
  return `${rejectedCount}개 파일이 ${MAX_FILE_SIZE_MB}MB를 초과하여 제외됐습니다.`;
}

/**
 * [Logic Hook] 구인공고 등록 화면의 사진 파일 상태를 담당합니다.
 *
 * petCount를 watch해서 petFiles 배열 크기를 내부에서 자동 동기화합니다.
 * — pet이 추가되면 빈 배열을 뒤에 삽입, pet이 제거되면 초과분을 잘라냅니다.
 * — URL.createObjectURL 결과는 파일 배열이 변경될 때만 재계산됩니다.
 * — 파일당 최대 크기: MAX_FILE_SIZE_MB MB. 초과 파일은 자동 제외되고 에러 메시지를 반환합니다.
 */
export function useJobPhotoFiles(petCount: number) {
  const [jobFiles, setJobFiles] = useState<File[]>([]);
  const [petFiles, setPetFiles] = useState<File[][]>([]);
  const [jobFileSizeError, setJobFileSizeError] = useState<string | null>(null);
  const [petFileSizeErrors, setPetFileSizeErrors] = useState<(string | null)[]>([]);

  // petCount 변화를 감지해 petFiles 배열 크기를 맞춤
  useEffect(() => {
    setPetFiles((prev) => {
      if (prev.length === petCount) return prev;
      if (prev.length < petCount) {
        const added = Array.from<File[]>({ length: petCount - prev.length }).map(() => []);
        return [...prev, ...added];
      }
      return prev.slice(0, petCount);
    });

    setPetFileSizeErrors((prev) => {
      if (prev.length === petCount) return prev;
      if (prev.length < petCount) {
        const added = Array.from<null>({ length: petCount - prev.length }).map(() => null);
        return [...prev, ...added];
      }
      return prev.slice(0, petCount);
    });
  }, [petCount]);

  const jobPreviewUrls = useMemo(
    () => jobFiles.map((file) => URL.createObjectURL(file)),
    [jobFiles],
  );

  const petPreviewUrls = useMemo(
    () => petFiles.map((files) => files.map((file) => URL.createObjectURL(file))),
    [petFiles],
  );

  const handleJobFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const { valid, rejectedCount } = filterBySize(Array.from(files));
    setJobFileSizeError(sizeErrorMessage(rejectedCount));
    setJobFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeJobFile = (index: number) => {
    setJobFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePetFileChange = (petIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const { valid, rejectedCount } = filterBySize(Array.from(files));
    setPetFileSizeErrors((prev) => {
      const next = [...prev];
      next[petIndex] = sizeErrorMessage(rejectedCount);
      return next;
    });
    setPetFiles((prev) => {
      const next = [...prev];
      next[petIndex] = [...(next[petIndex] ?? []), ...valid];
      return next;
    });
    e.target.value = '';
  };

  const removePetFile = (petIndex: number, fileIndex: number) => {
    setPetFiles((prev) => {
      const next = [...prev];
      next[petIndex] = (next[petIndex] ?? []).filter((_, i) => i !== fileIndex);
      return next;
    });
  };

  return {
    jobFiles,
    jobPreviewUrls,
    handleJobFileChange,
    removeJobFile,
    jobFileSizeError,
    petFiles,
    petPreviewUrls,
    handlePetFileChange,
    removePetFile,
    petFileSizeErrors,
  };
}
