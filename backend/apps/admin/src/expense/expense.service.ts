import { Injectable, NotFoundException } from '@nestjs/common'; import { PrismaService } from '@app/prisma';
@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll() { return this.prisma.expense.findMany({ orderBy: { createdAt: 'desc' } }); }
  async create(data: { amount: number; reason: string }) { return this.prisma.expense.create({ data }); }
  async update(id: string, data: { amount?: number; reason?: string }) { await this.findOne(id); return this.prisma.expense.update({ where: { id }, data }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.expense.delete({ where: { id } }); }
  async getTotal() { const r = await this.prisma.expense.aggregate({ _sum: { amount: true } }); return Number(r._sum.amount ?? 0); }
  private async findOne(id: string) { const e = await this.prisma.expense.findUnique({ where: { id } }); if (!e) throw new NotFoundException('المصروف غير موجود'); return e; }
}
