import { gql } from '@apollo/client';

const PHOTO_FIELDS = `
  id url file_name original_name mime_type size uploader_id user_id job_id pet_id createdAt
`;

const USER_FIELDS = `
  id
  email
  full_name
  roles
  photos { ${PHOTO_FIELDS} }
  createdAt
  updatedAt
`;

/**
 * POST /users — 회원가입
 */
export const CREATE_USER = gql`
  mutation CreateUser(
    $email: String!
    $full_name: String!
    $password: String!
    $roles: [String!]!
  ) {
    createUser(email: $email, full_name: $full_name, password: $password, roles: $roles) {
      ${USER_FIELDS}
    }
  }
`;

/**
 * PUT /users/:id — 사용자 정보 수정
 */
export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $email: String
    $full_name: String
    $password: String
    $roles: [String!]
  ) {
    updateUser(id: $id, email: $email, full_name: $full_name, password: $password, roles: $roles) {
      ${USER_FIELDS}
    }
  }
`;

/**
 * DELETE /users/:id — 사용자 삭제
 */
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
