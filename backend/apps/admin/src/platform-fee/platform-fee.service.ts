import { Injectable, NotFoundException } from '@nestjs/common'; import { PrismaService } from '@app/prisma';
@Injectable()
export class PlatformFeeService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll() { return this.prisma.platformFee.findMany({ orderBy: { createdAt: 'desc' } }); }
  async getActive() { return this.prisma.platformFee.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }); }
  async create(data: { amount: number; currency?: string; description?: string }) {
    await this.prisma.platformFee.updateMany({ data: { isActive: false } });
    return this.prisma.platformFee.create({ data: { amount: data.amount, currency: data.currency ?? 'جنيه سوداني', description: data.description, isActive: true } });
  }
  async update(id: string, data: any) { await this.findOne(id); return this.prisma.platformFee.update({ where: { id }, data }); }
  async activate(id: string) {
    await this.findOne(id);
    await this.prisma.platformFee.updateMany({ where: { isActive: true }, data: { isActive: false } });
    return this.prisma.platformFee.update({ where: { id }, data: { isActive: true } });
  }
  async remove(id: string) { await this.findOne(id); return this.prisma.platformFee.delete({ where: { id } }); }
  private async findOne(id: string) { const f = await this.prisma.platformFee.findUnique({ where: { id } }); if (!f) throw new NotFoundException('غير موجود'); return f; }
}
