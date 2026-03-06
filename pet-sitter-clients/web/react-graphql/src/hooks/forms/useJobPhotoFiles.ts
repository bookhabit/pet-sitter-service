import { useEffect, useMemo, useState } from 'react';

/**
 * [Logic Hook] 구인공고 등록 화면의 사진 파일 상태를 담당합니다.
 *
 * petCount를 watch해서 petFiles 배열 크기를 내부에서 자동 동기화합니다.
 * — pet이 추가되면 빈 배열을 뒤에 삽입, pet이 제거되면 초과분을 잘라냅니다.
 * — URL.createObjectURL 결과는 파일 배열이 변경될 때만 재계산됩니다.
 */
export function useJobPhotoFiles(petCount: number) {
  const [jobFiles, setJobFiles] = useState<File[]>([]);
  const [petFiles, setPetFiles] = useState<File[][]>([]);

  // petCount 변화를 감지해 petFiles 배열 크기를 맞춤
  useEffect(() => {
    setPetFiles((prev) => {
      if (prev.length === petCount) return prev;

      if (prev.length < petCount) {
        // pet 추가: 부족한 만큼 빈 배열 삽입
        const added = Array.from<File[]>({ length: petCount - prev.length }).map(() => []);
        return [...prev, ...added];
      }

      // pet 제거: 초과분 잘라냄
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
    setJobFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeJobFile = (index: number) => {
    setJobFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePetFileChange = (petIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setPetFiles((prev) => {
      const next = [...prev];
      next[petIndex] = [...(next[petIndex] ?? []), ...Array.from(files)];
      return next;
    });
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
    petFiles,
    petPreviewUrls,
    handlePetFileChange,
    removePetFile,
  };
}
