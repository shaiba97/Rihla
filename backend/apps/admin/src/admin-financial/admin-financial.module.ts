import { Module } from '@nestjs/common'; import { PrismaModule } from '@app/prisma'; import { PdfModule } from '@app/pdf'; import { AdminFinancialController } from './admin-financial.controller'; import { AdminFinancialService } from './admin-financial.service';
@Module({ imports: [PrismaModule, PdfModule], controllers: [AdminFinancialController], providers: [AdminFinancialService] })
export class AdminFinancialModule {}
