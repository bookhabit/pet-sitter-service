import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto): Promise<void> {
    return Promise.resolve();
  }

  verifyEmail(dto: VerifyEmailDto): Promise<string> {
    return Promise.resolve(
      `This action verifies email ${dto.signupVerifyToken}`,
    );
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
