import { gql } from '@apollo/client';

const PHOTO_FIELDS = `
  id
  url
  file_name
  original_name
  mime_type
  size
  uploader_id
  user_id
  job_id
  pet_id
  createdAt
`;

/**
 * 다중 사진 업로드 (entity 미연결)
 *
 * 서버 스키마: uploadPhotos(files: [Base64FileInput!]!): [PhotoModel!]!
 * Base64FileInput: { base64: String!, mimeType: String!, originalName: String! }
 */
export const UPLOAD_PHOTOS = gql`
  mutation UploadPhotos($files: [Base64FileInput!]!) {
    uploadPhotos(files: $files) {
      ${PHOTO_FIELDS}
    }
  }
`;

/**
 * 사용자 프로필 사진 업로드
 *
 * 서버 스키마: uploadUserPhoto(file: Base64FileInput!, userId: String!): PhotoModel!
 */
export const UPLOAD_USER_PHOTO = gql`
  mutation UploadUserPhoto($userId: String!, $file: Base64FileInput!) {
    uploadUserPhoto(userId: $userId, file: $file) {
      ${PHOTO_FIELDS}
    }
  }
`;

/**
 * 공고 사진 업로드
 *
 * 서버 스키마: uploadJobPhoto(file: Base64FileInput!, jobId: String!): PhotoModel!
 */
export const UPLOAD_JOB_PHOTO = gql`
  mutation UploadJobPhoto($jobId: String!, $file: Base64FileInput!) {
    uploadJobPhoto(jobId: $jobId, file: $file) {
      ${PHOTO_FIELDS}
    }
  }
`;

/**
 * 반려동물 사진 업로드
 *
 * 서버 스키마: uploadPetPhoto(file: Base64FileInput!, petId: String!): PhotoModel!
 */
export const UPLOAD_PET_PHOTO = gql`
  mutation UploadPetPhoto($petId: String!, $file: Base64FileInput!) {
    uploadPetPhoto(petId: $petId, file: $file) {
      ${PHOTO_FIELDS}
    }
  }
`;

/**
 * 사진 삭제
 *
 * 서버 스키마: deletePhoto(id: String!): Boolean!
 */
export const DELETE_PHOTO = gql`
  mutation DeletePhoto($id: String!) {
    deletePhoto(id: $id)
  }
`;
