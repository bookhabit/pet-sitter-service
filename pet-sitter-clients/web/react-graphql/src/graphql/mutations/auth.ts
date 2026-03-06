import { gql } from '@apollo/client';

/**
 * POST /sessions — 로그인
 */
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user_id
      accessToken
      refreshToken
    }
  }
`;

/**
 * DELETE /sessions — 로그아웃
 */
export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
