import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PlatformFeeModule } from './platform-fee/platform-fee.module';
import { PaymentAccountsModule } from './payment-accounts/payment-accounts.module';
import { ExpenseModule } from './expense/expense.module';
import { AdminFinancialModule } from './admin-financial/admin-financial.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { SupportContactsModule } from './support-contacts/support-contacts.module';
import { RihlaWsModule } from '@app/websocket';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, PlatformFeeModule, PaymentAccountsModule, ExpenseModule, AdminFinancialModule, AdminUsersModule, SupportContactsModule, RihlaWsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
