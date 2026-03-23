import { gql } from '@apollo/client';

const USER_FIELDS = `
  id
  email
  full_name
  roles
  photos { id url file_name original_name mime_type size uploader_id user_id job_id pet_id createdAt }
  createdAt
  updatedAt
`;

/**
 * 사용자 정보 수정
 *
 * 서버 스키마: updateUser(data: UpdateUserInput!, id: String!): UserModel!
 * UpdateUserInput: { email?, full_name?, password?, roles?: [Role!] }
 */
export const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $data: UpdateUserInput!) {
    updateUser(id: $id, data: $data) {
      ${USER_FIELDS}
    }
  }
`;

/**
 * 사용자 삭제
 *
 * 서버 스키마: deleteUser(id: String!): Boolean!
 */
export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;
