import { Injectable } from '@nestjs/common';
import { VerifyEmailDto } from './dto/verify-user.dto';
import * as uuid from 'uuid';
import { EmailService } from 'src/email/email.service';
import { LoginDto } from './dto/login-user.dto';
import { UserInfo } from './UserInfo';

@Injectable()
export class UsersService {
  constructor(private emailService: EmailService) {}

  /**
   * 회원 가입
   * @param name
   * @param email
   * @param password
   */
  async createUser(name: string, email: string, password: string) {
    await this.checkUserExists(email);

    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, password, signupVerifyToken);

    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }
  private checkUserExists(email: string): Promise<boolean> {
    return Promise.resolve(false); // TODO : DB연동 후 구현
  }

  private saveUser(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ): Promise<void> {
    console.log('saveUser', name, email, password, signupVerifyToken);
    return Promise.resolve(); // TODO : DB연동 후 구현
  }

  private sendMemberJoinEmail(
    email: string,
    signupVerifyToken: string,
  ): Promise<void> {
    console.log('sendMemberJoinEmail', email, signupVerifyToken);
    return this.emailService.sendMemberJoinEmail(email, signupVerifyToken);
  }

  /**
   * 이메일 인증
   * @param dto
   * @returns
   */
  verifyEmail(dto: VerifyEmailDto): Promise<string> {
    // TODO : DB연동 후 구현
    // 1. db에서 signupVerifyToken으로 회원 가입 여부 확인 후 에러처리
    // 2. 로그인 - jwt 토큰 발급
    return Promise.resolve('method verifyEmail');
  }

  /**
   * 로그인
   * @param dto
   * @returns
   */
  login(dto: LoginDto): Promise<string> {
    // TODO
    // 1. email, password 를 가진 유저가 존재하는지 db 에서 확인 후 에러처리
    // 2. 존재한다면 jwt 토큰 발급
    // 3. 존재하지 않는다면 에러 처리
    return Promise.resolve('method login');
  }

  /**
   * 유저 정보 조회
   * @param id
   * @returns
   */
  getUserInfo(id: string): Promise<UserInfo> {
    // TODO
    // 1. id를 가진 유저가 존재하는지 db 에서 확인 후 에러처리
    // 2. 존재한다면 유저 UserInfo type으로 반환
    // 3. 존재하지 않는다면 에러 처리
    return Promise.resolve({ id: 1, name: 'test', email: 'test@test.com' });
  }
}
