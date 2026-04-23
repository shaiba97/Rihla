import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '@app/prisma';

interface BookingWithTripAndBus {
  id: string;
  seatNumber: number;
  passengerName: string;
  passengerGender: 'MALE' | 'FEMALE';
  trip: {
    fromCity: string;
    fromStation: string;
    toCity: string;
    toStation: string;
    departureDate: Date;
    departureTime: Date;
    bus?: {
      name: string;
    };
  } | null;
}

@Injectable()
export class PDFService {
  private readonly logger = new Logger(PDFService.name);
  private outputDir = './uploads/tickets';

  constructor(private readonly prisma: PrismaService) {}

  async generateTicket(bookingId: string): Promise<string> {
    const outputDir = path.resolve(this.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `ticket_${bookingId}.pdf`;
    const outputPath = path.join(outputDir, filename);
    const publicUrl = `/uploads/tickets/${filename}`;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: { include: { bus: true } }, customer: true },
    });

    if (!booking) {
      throw new Error('الحجز غير موجود');
    }

    const html = this.buildTicketHTML(booking);

    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({
          path: outputPath,
          format: 'A5',
          printBackground: true,
          margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        });
      } finally {
        await browser.close();
      }
    } catch (error) {
      this.logger.warn('PDF generation failed, creating placeholder', error);
      fs.writeFileSync(outputPath, 'PDF placeholder');
    }

    return publicUrl;
  }

  private buildTicketHTML(booking: BookingWithTripAndBus): string {
    const trip = booking.trip;
    const bus = trip?.bus;

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Tajawal', sans-serif; background: #f5f7fa; padding: 20px; direction: rtl; }
.ticket { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.ticket-header { background: linear-gradient(135deg, #8B5E3C, #6E472D); color: white; padding: 24px; text-align: center; }
.ticket-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.ticket-header p { font-size: 14px; opacity: 0.85; }
.ticket-body { padding: 24px; }
.route-section { display: flex; align-items: center; justify-content: space-between; background: #F5EFEA; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.route-city { text-align: center; }
.route-city .city-name { font-size: 22px; font-weight: 700; color: #1F2937; }
.route-city .city-sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
.route-arrow { font-size: 28px; color: #8B5E3C; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.info-item { background: #f9f9f9; border: 1px solid #E8E0D8; border-radius: 10px; padding: 12px; }
.info-item .label { font-size: 11px; color: #9CA3AF; margin-bottom: 4px; }
.info-item .value { font-size: 15px; font-weight: 600; color: #1F2937; }
.seat-badge { background: #8B5E3C; color: white; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin: 0 auto 20px; }
.divider { border: none; border-top: 2px dashed #E8E0D8; margin: 20px 0; }
.booking-id { text-align: center; font-size: 12px; color: #9CA3AF; }
.booking-id span { font-family: monospace; font-size: 11px; }
.ticket-footer { background: #F5EFEA; padding: 16px 24px; text-align: center; font-size: 12px; color: #6B7280; }
</style>
</head>
<body>
<div class="ticket">
<div class="ticket-header"><h1>🚌 رحلة</h1><p>تذكرة سفر — Bus Ticket</p></div>
<div class="ticket-body">
<div class="route-section">
<div class="route-city"><div class="city-name">${trip?.fromCity || '—'}</div><div class="city-sub">${trip?.fromStation || ''}</div></div>
<div class="route-arrow">←</div>
<div class="route-city"><div class="city-name">${trip?.toCity || '—'}</div><div class="city-sub">${trip?.toStation || ''}</div></div>
</div>
<div class="seat-badge">${booking.seatNumber}</div>
<div class="info-grid">
<div class="info-item"><div class="label">اسم المسافر</div><div class="value">${booking.passengerName}</div></div>
<div class="info-item"><div class="label">رقم المقعد</div><div class="value">${booking.seatNumber}</div></div>
<div class="info-item"><div class="label">تاريخ السفر</div><div class="value">${trip?.departureDate ? new Date(trip.departureDate).toLocaleDateString('ar-SD') : '—'}</div></div>
<div class="info-item"><div class="label">وقت الانطلاق</div><div class="value">${trip?.departureTime ? new Date(trip.departureTime).toLocaleTimeString('ar-SD') : '—'}</div></div>
<div class="info-item"><div class="label">الحافلة</div><div class="value">${bus?.name || '—'}</div></div>
<div class="info-item"><div class="label">الجنس</div><div class="value">${booking.passengerGender === 'MALE' ? 'ذكر' : 'أنثى'}</div></div>
</div>
<hr class="divider">
<div class="booking-id">رقم الحجز<br><span>${booking.id}</span></div>
</div>
<div class="ticket-footer">يُرجى الحضور قبل موعد الانطلاق بـ 30 دقيقة</div>
</div>
</body>
</html>`;
  }
}
