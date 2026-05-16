import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialSummary(companyId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        Booking: { Trip: { Bus: { companyId } } },
        status: 'SUCCESS',
      },
      include: { Booking: { include: { Trip: true } } },
    });

    const totalRevenue = payments.reduce((s, p) => s + Number(p.totalAmount ?? 0), 0);
    const totalCommission = payments.reduce((s, p) => s + Number(p.commissionAmount ?? 0), 0);
    const netEarnings = payments.reduce((s, p) => s + Number(p.companyAmount ?? 0), 0);

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthPayments = payments.filter(p => new Date(p.createdAt) >= startOfMonth);
    const thisMonthRevenue = thisMonthPayments.reduce((s, p) => s + Number(p.totalAmount ?? 0), 0);

    const totalBookings = await this.prisma.booking.count({ where: { Trip: { Bus: { companyId } }, status: 'CONFIRMED' } });
    const pendingBookings = await this.prisma.booking.count({ where: { Trip: { Bus: { companyId } }, status: 'PENDING' } });

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPayments = payments.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    const dailyMap: Record<string, number> = {};
    recentPayments.forEach(p => {
      const date = new Date(p.createdAt).toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] ?? 0) + Number(p.companyAmount ?? 0);
    });
    const dailyRevenue = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

    const tripMap: Record<string, { tripId: string; from: string; to: string; revenue: number; bookings: number }> = {};
    payments.forEach(p => {
      const trip = p.Booking?.Trip; if (!trip) return;
      if (!tripMap[trip.id]) tripMap[trip.id] = { tripId: trip.id, from: trip.fromCity ?? '', to: trip.toCity ?? '', revenue: 0, bookings: 0 };
      tripMap[trip.id].revenue += Number(p.companyAmount ?? 0);
      tripMap[trip.id].bookings += 1;
    });
    const topTrips = Object.values(tripMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const recentPaymentsList = payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map(p => ({
      id: p.id, bookingId: p.bookingId, totalAmount: Number(p.totalAmount),
      companyAmount: Number(p.companyAmount), commissionAmount: Number(p.commissionAmount),
      paymentMethod: p.paymentMethod, createdAt: p.createdAt,
      from: p.Booking?.Trip?.fromCity, to: p.Booking?.Trip?.toCity,
    }));

    return { totalRevenue, totalCommission, netEarnings, thisMonthRevenue, totalBookings, pendingBookings, dailyRevenue, topTrips, recentPayments: recentPaymentsList };
  }
}
