import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma ??= this;
      return globalForPrisma.prisma as PrismaService;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
}
