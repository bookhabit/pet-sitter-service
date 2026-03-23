import { gql } from '@apollo/client';

/**
 * 로그인
 *
 * 서버 스키마: login(data: LoginInput!): AuthPayload!
 * LoginInput: { email: String!, password: String! }
 */
export const LOGIN = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      user_id
      accessToken
      refreshToken
    }
  }
`;

/**
 * 회원가입
 *
 * 서버 스키마: register(data: RegisterInput!): UserModel!
 * RegisterInput: { email, full_name, password, roles: [Role!]! }
 */
export const REGISTER = gql`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      id
      email
      full_name
      roles
      photos { id url createdAt }
      createdAt
      updatedAt
    }
  }
`;
