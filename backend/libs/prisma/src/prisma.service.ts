import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);

    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      adapter,
    });
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      const err = error as { message?: string };
      console.error(' Database connection failed:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get bus() { return this.prisma.bus; }
  get trip() { return this.prisma.trip; }
  get user() { return this.prisma.user; }
  get booking() { return this.prisma.booking; }
  get payment() { return this.prisma.payment; }
  get ticketPDF() { return this.prisma.ticketPDF; }

  async $connect() { return this.prisma.$connect(); }
  async $disconnect() { return this.prisma.$disconnect(); }
}
