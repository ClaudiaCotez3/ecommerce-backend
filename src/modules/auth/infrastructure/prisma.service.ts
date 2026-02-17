import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to the database');
    } catch (error) {
      this.logger.error('❌ Failed to connect to the database:', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('❌ Disconnected from the database');
  }
}
