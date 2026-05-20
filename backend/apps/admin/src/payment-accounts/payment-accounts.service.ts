import { Injectable, NotFoundException } from '@nestjs/common'; import { PrismaService } from '@app/prisma';
@Injectable()
export class PaymentAccountsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll() { return this.prisma.paymentAccount.findMany({ orderBy: { createdAt: 'desc' } }); }
  async create(data: any) {
    if (!data.gatewayKey) data.gatewayKey = data.gatewayName;
    return this.prisma.paymentAccount.create({ data });
  }
  async update(id: string, data: any) { await this.findOne(id); return this.prisma.paymentAccount.update({ where: { id }, data }); }
  async toggleActive(id: string) { const a = await this.findOne(id); return this.prisma.paymentAccount.update({ where: { id }, data: { isActive: !a.isActive } }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.paymentAccount.delete({ where: { id } }); }
  private async findOne(id: string) { const a = await this.prisma.paymentAccount.findUnique({ where: { id } }); if (!a) throw new NotFoundException('غير موجود'); return a; }
}
