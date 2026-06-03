import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '@app/prisma';

import pdfMake from 'pdfmake';

interface TFontDictionary {
  [key: string]: {
    normal: string;
    bold: string;
  };
}

@Injectable()
export class PDFService {
  private readonly logger = new Logger(PDFService.name);
  private outputDir = './upload';
  constructor(private readonly prisma: PrismaService) {
    const fontsDir = path.resolve(process.cwd(), 'fonts');
    const fonts: TFontDictionary = {
      Tajawal: {
        normal: path.join(fontsDir, 'Tajawal-Regular.ttf'),
        bold: path.join(fontsDir, 'Tajawal-Bold.ttf'),
      },
    };
    pdfMake.fonts = fonts;
  }

  // async generateTicket(
  //   bookingId: string,
  // ): Promise<{ publicUrl: string; filePath: string }> {
  //   const outputDir = path.resolve(this.outputDir);
  //   if (!fs.existsSync(outputDir)) {
  //     fs.mkdirSync(outputDir, { recursive: true });
  //   }

  //   const filename = `ticket_${bookingId}.pdf`;
  //   const outputPath = path.join(outputDir, filename);
  //   const publicUrl = `/upload/${filename}`;

  //   const payment = await this.prisma.payment.findUnique({
  //     where: { bookingId: bookingId },
  //     include: {
  //       Booking: {
  //         include: {
  //           Trip: { include: { Bus: true } },
  //         },
  //       },
  //     },
  //   });

  //   if (!payment) {
  //     throw new Error('الحجز غير موجود');
  //   }

  //   try {
  //     const docDefinition = await this.buildTicketDefinition(payment);
  //     const pdfDoc = pdfMake.createPdf(docDefinition);
  //     const buffer = await pdfDoc.getBuffer();
  //     fs.writeFileSync(outputPath, buffer);
  //   } catch (error: any) {
  //     const errStack = error?.stack || error?.message || String(error);
  //     this.logger.error(`فشل في إنشاء ملف PDF للتذكرة ${bookingId}`, errStack);
  //     fs.writeFileSync(outputPath, errStack);
  //   }

  //   return { publicUrl, filePath: outputPath };
  // }

  // async generatePassengerList(
  //   trip: any,
  //   bookings: any[],
  // ): Promise<{ publicUrl: string; filePath: string }> {
  //   const outputDir = path.resolve(this.outputDir);
  //   if (!fs.existsSync(outputDir)) {
  //     fs.mkdirSync(outputDir, { recursive: true });
  //   }

  //   const filename = `passengers_${trip.id}.pdf`;
  //   const outputPath = path.join(outputDir, filename);
  //   const publicUrl = `/upload/${filename}`;

  //   try {
  //     const docDefinition = this.buildPassengerListDefinition(trip, bookings);
  //     const pdfDoc = pdfMake.createPdf(docDefinition);
  //     const buffer = await pdfDoc.getBuffer();
  //     fs.writeFileSync(outputPath, buffer);
  //   } catch (error: any) {
  //     this.logger.error(
  //       `فشل في إنشاء ملف PDF لقائمة الركاب للرحلة ${trip.id}`,
  //       error?.stack || error?.message || error,
  //     );
  //     fs.writeFileSync(outputPath, 'PDF placeholder');
  //   }

  //   return { publicUrl, filePath: outputPath };
  // }

  // private async buildTicketDefinition(payment: any): Promise<any> {
  //   const booking = payment.Booking;
  //   const trip = booking.Trip;
  //   const bus = trip?.Bus;

  //   // Format Arabic date
  //   const formatArabicDate = (date: Date | string): string => {
  //     const d = new Date(date);
  //     return d.toLocaleDateString('ar-EG', {
  //       weekday: 'long',
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric',
  //     });
  //   };

  //   // Format Arabic time
  //   const formatArabicTime = (time: string): string => {
  //     if (!time) return '—';
  //     const [hours, minutes] = time.split(':');
  //     const date = new Date();
  //     date.setHours(parseInt(hours), parseInt(minutes));
  //     return date.toLocaleTimeString('ar-EG', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: false,
  //     });
  //   };

  //   // Format Arabic price
  //   const formatArabicPrice = (price: number): string => {
  //     return new Intl.NumberFormat('ar-EG', {
  //       style: 'currency',
  //       currency: 'SDG',
  //       minimumFractionDigits: 0,
  //     }).format(price);
  //   };

  //   // Parse bus plate JSON
  //   const plateData = bus?.plate
  //     ? typeof bus.plate === 'string'
  //       ? JSON.parse(bus.plate)
  //       : bus.plate
  //     : { arabic: '---', english: '---', numbers: '---' };

  //   // Get passengers array
  //   const passengers = Array.isArray(booking.passenger)
  //     ? booking.passenger
  //     : [booking.passenger || {}];

  //   const seatNumbers = booking.seatNumbers || [booking.seatNumber];

  //   // Read logo as base64
  //   let logoBase64 = '';
  //   try {
  //     const logoPath = path.join(
  //       process.cwd(),
  //       'backend/assets/companyLogo.png',
  //     );
  //     if (fs.existsSync(logoPath)) {
  //       const logoBuffer = fs.readFileSync(logoPath);
  //       logoBase64 = logoBuffer.toString('base64');
  //     }
  //   } catch (error) {
  //     this.logger.warn('Logo not found, using text fallback');
  //   }

  //   // Passenger table rows
  //   const passengerBody = [
  //     [
  //       { text: 'الاسم', style: 'tableHeader', alignment: 'center' },
  //       { text: 'العمر', style: 'tableHeader', alignment: 'center' },
  //       { text: 'الجنس', style: 'tableHeader', alignment: 'center' },
  //       { text: 'رقم المقعد', style: 'tableHeader', alignment: 'center' },
  //     ],
  //   ];

  //   passengers.forEach((passenger: any, idx: number) => {
  //     passengerBody.push([
  //       {
  //         text: passenger.name || '—',
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //       {
  //         text: passenger.age?.toString() || '—',
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //       {
  //         text: passenger.gender === 'MALE' ? 'ذكر' : 'أنثى',
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //       {
  //         text: seatNumbers[idx]?.toString() || '—',
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //     ]);
  //   });

  //   // Payment details table
  //   const platformFee = Number(payment.platformFeeAmount) || 0;
  //   const totalAmount = Number(payment.totalAmount);
  //   const companyAmount = Number(payment.companyAmount);
  //   const ticketPrice = Number(trip.price);

  //   const paymentBody = [
  //     [
  //       { text: 'البيان', style: 'tableHeader', alignment: 'center' },
  //       { text: 'المبلغ', style: 'tableHeader', alignment: 'center' },
  //     ],
  //     [
  //       { text: 'سعر التذكرة', style: 'tableCell', alignment: 'center' },
  //       {
  //         text: formatArabicPrice(ticketPrice),
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //     ],
  //     [
  //       { text: 'رسوم المنصة', style: 'tableCell', alignment: 'center' },
  //       {
  //         text: formatArabicPrice(platformFee),
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //     ],
  //     [
  //       {
  //         text: 'المدفوع (لشركة الحافلات)',
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //       {
  //         text: formatArabicPrice(companyAmount),
  //         style: 'tableCell',
  //         alignment: 'center',
  //       },
  //     ],
  //     [
  //       { text: 'الإجمالي المدفوع', style: 'totalCell', alignment: 'center' },
  //       {
  //         text: formatArabicPrice(totalAmount),
  //         style: 'totalCell',
  //         alignment: 'center',
  //       },
  //     ],
  //   ];

  //   return {
  //     pageSize: 'A5',
  //     pageMargins: [20, 20, 20, 20],
  //     defaultStyle: {
  //       font: 'Tajawal',
  //       fontSize: 9,
  //       alignment: 'right',
  //     },
  //     content: [
  //       // Header with Logo and Title
  //       {
  //         columns: [
  //           {
  //             width: 'auto',
  //             stack: logoBase64
  //               ? [
  //                   {
  //                     image: `data:image/png;base64,${logoBase64}`,
  //                     width: 50,
  //                     height: 50,
  //                     alignment: 'right',
  //                   },
  //                 ]
  //               : [{ text: '', width: 50 }],
  //           },
  //           {
  //             width: '*',
  //             text: 'رحلة',
  //             style: 'headerTitle',
  //             alignment: 'center',
  //           },
  //           {
  //             width: 'auto',
  //             text: '',
  //           },
  //         ],
  //         margin: [0, 0, 0, 15],
  //       },

  //       // Divider
  //       {
  //         canvas: [
  //           {
  //             type: 'line',
  //             x1: 0,
  //             y1: 0,
  //             x2: 515,
  //             y2: 0,
  //             lineWidth: 2,
  //             lineColor: '#0D9488',
  //           },
  //         ],
  //         margin: [0, 0, 0, 10],
  //       },

  //       // Bus Details Section
  //       {
  //         text: 'تفاصيل الحافلة',
  //         style: 'sectionTitle',
  //         margin: [0, 10, 0, 8],
  //       },
  //       {
  //         stack: [
  //           {
  //             text: bus?.name || '—',
  //             style: 'busName',
  //             alignment: 'center',
  //           },
  //           {
  //             margin: [0, 10, 0, 10],
  //             columns: [
  //               {
  //                 width: '*',
  //                 stack: [
  //                   { text: 'رقم اللوحة', style: 'label', alignment: 'center' },
  //                   {
  //                     table: {
  //                       widths: ['*', 'auto', '*'],
  //                       body: [
  //                         [
  //                           {
  //                             text: plateData.arabic || '—',
  //                             style: 'plateText',
  //                             alignment: 'center',
  //                           },
  //                           {
  //                             text: '|',
  //                             style: 'plateText',
  //                             alignment: 'center',
  //                           },
  //                           {
  //                             text: plateData.english || '—',
  //                             style: 'plateText',
  //                             alignment: 'center',
  //                           },
  //                         ],
  //                         [
  //                           {
  //                             text: 'عربي',
  //                             style: 'plateLabel',
  //                             alignment: 'center',
  //                           },
  //                           {},
  //                           {
  //                             text: 'إنجليزي',
  //                             style: 'plateLabel',
  //                             alignment: 'center',
  //                           },
  //                         ],
  //                       ],
  //                     },
  //                     layout: 'noBorders',
  //                   },
  //                   {
  //                     text: plateData.numbers || '—',
  //                     style: 'plateNumbers',
  //                     alignment: 'center',
  //                     margin: [0, 8, 0, 0],
  //                   },
  //                 ],
  //               },
  //             ],
  //           },
  //         ],
  //       },

  //       // Trip Details Section
  //       {
  //         text: 'تفاصيل الرحلة',
  //         style: 'sectionTitle',
  //         margin: [0, 15, 0, 8],
  //       },
  //       {
  //         table: {
  //           widths: ['*', '*'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   {
  //                     text: 'المغادرة',
  //                     style: 'subSectionTitle',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.fromState || '—',
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.fromCity || '—',
  //                     style: 'infoTextBold',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.fromStation || '—',
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: formatArabicDate(trip?.departureDate),
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: formatArabicTime(trip?.departureTime),
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                 ],
  //                 margin: [0, 0, 0, 10],
  //               },
  //               {
  //                 stack: [
  //                   {
  //                     text: 'الوصول',
  //                     style: 'subSectionTitle',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.toState || '—',
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.toCity || '—',
  //                     style: 'infoTextBold',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: trip?.toStation || '—',
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: formatArabicDate(trip?.arrivalDate),
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: formatArabicTime(trip?.arrivalTime),
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                 ],
  //                 margin: [0, 0, 0, 10],
  //               },
  //             ],
  //             [
  //               {
  //                 stack: [
  //                   {
  //                     text: 'السعر',
  //                     style: 'subSectionTitle',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text: formatArabicPrice(trip?.price),
  //                     style: 'priceText',
  //                     alignment: 'center',
  //                   },
  //                 ],
  //               },
  //               {
  //                 stack: [
  //                   {
  //                     text: 'الحالة',
  //                     style: 'subSectionTitle',
  //                     alignment: 'center',
  //                   },
  //                   {
  //                     text:
  //                       trip?.status === 'SCHEDULED'
  //                         ? 'مجدولة'
  //                         : trip?.status === 'IN_PROGRESS'
  //                           ? 'قيد التنفيذ'
  //                           : trip?.status === 'COMPLETED'
  //                             ? 'مكتملة'
  //                             : 'ملغاة',
  //                     style: 'infoText',
  //                     alignment: 'center',
  //                   },
  //                 ],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 0,
  //           vLineWidth: () => 1,
  //           vLineColor: () => '#99F6E4',
  //           paddingLeft: () => 8,
  //           paddingRight: () => 8,
  //           paddingTop: () => 6,
  //           paddingBottom: () => 6,
  //         },
  //       },

  //       // Passenger Details Section
  //       {
  //         text: 'بيانات الركاب',
  //         style: 'sectionTitle',
  //         margin: [0, 20, 0, 8],
  //       },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['*', '*', '*', '*'],
  //           body: passengerBody,
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           hLineColor: () => '#99F6E4',
  //           vLineWidth: () => 1,
  //           vLineColor: () => '#99F6E4',
  //           paddingTop: () => 8,
  //           paddingBottom: () => 8,
  //         },
  //       },

  //       // Payment Details Section
  //       {
  //         text: 'تفاصيل الدفع',
  //         style: 'sectionTitle',
  //         margin: [0, 20, 0, 8],
  //       },
  //       {
  //         table: {
  //           widths: ['*', '*'],
  //           body: paymentBody,
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           hLineColor: () => '#99F6E4',
  //           vLineWidth: () => 1,
  //           vLineColor: () => '#99F6E4',
  //           paddingTop: () => 8,
  //           paddingBottom: () => 8,
  //         },
  //       },

  //       // Footer
  //       {
  //         text: 'يُرجى الحضور قبل موعد الانطلاق بـ 30 دقيقة',
  //         style: 'footer',
  //         alignment: 'center',
  //         margin: [0, 30, 0, 0],
  //       },
  //       {
  //         text: `رقم الحجز: ${booking.id}`,
  //         style: 'bookingId',
  //         alignment: 'center',
  //         margin: [0, 10, 0, 0],
  //       },
  //     ],
  //     styles: {
  //       headerTitle: {
  //         fontSize: 24,
  //         bold: true,
  //         color: '#0D9488',
  //       },
  //       sectionTitle: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#0D9488',
  //         margin: [0, 0, 0, 5],
  //       },
  //       subSectionTitle: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#0F766E',
  //         margin: [0, 0, 0, 8],
  //       },
  //       busName: {
  //         fontSize: 14,
  //         bold: true,
  //         color: '#134E4A',
  //       },
  //       label: {
  //         fontSize: 8,
  //         color: '#5EEAD4',
  //         margin: [0, 0, 0, 5],
  //       },
  //       plateText: {
  //         fontSize: 16,
  //         bold: true,
  //         color: '#134E4A',
  //       },
  //       plateLabel: {
  //         fontSize: 7,
  //         color: '#5EEAD4',
  //       },
  //       plateNumbers: {
  //         fontSize: 18,
  //         bold: true,
  //         color: '#0D9488',
  //         fillColor: '#CCFBF1',
  //         margin: [0, 4, 0, 4],
  //         padding: 4,
  //       },
  //       infoText: {
  //         fontSize: 9,
  //         color: '#0F766E',
  //         margin: [0, 2, 0, 2],
  //       },
  //       infoTextBold: {
  //         fontSize: 11,
  //         bold: true,
  //         color: '#134E4A',
  //         margin: [0, 2, 0, 2],
  //       },
  //       priceText: {
  //         fontSize: 14,
  //         bold: true,
  //         color: '#0D9488',
  //         margin: [0, 5, 0, 5],
  //       },
  //       tableHeader: {
  //         fontSize: 9,
  //         bold: true,
  //         color: '#FFFFFF',
  //         fillColor: '#0D9488',
  //       },
  //       tableCell: {
  //         fontSize: 9,
  //         color: '#134E4A',
  //       },
  //       totalCell: {
  //         fontSize: 11,
  //         bold: true,
  //         color: '#FFFFFF',
  //         fillColor: '#0D9488',
  //       },
  //       footer: {
  //         fontSize: 8,
  //         color: '#0F766E',
  //       },
  //       bookingId: {
  //         fontSize: 7,
  //         color: '#5EEAD4',
  //       },
  //     },
  //   };
  // }

  // private buildPassengerListDefinition(trip: any, bookings: any[]): any {
  //   const arabicDigits: Record<string, string> = {
  //     '0': '٠',
  //     '1': '١',
  //     '2': '٢',
  //     '3': '٣',
  //     '4': '٤',
  //     '5': '٥',
  //     '6': '٦',
  //     '7': '٧',
  //     '8': '٨',
  //     '9': '٩',
  //   };
  //   const toArabicNum = (n: any): string =>
  //     String(n).replace(/[0-9]/g, (d) => arabicDigits[d]);

  //   const arabicMonths = [
  //     'يناير',
  //     'فبراير',
  //     'مارس',
  //     'أبريل',
  //     'مايو',
  //     'يونيو',
  //     'يوليو',
  //     'أغسطس',
  //     'سبتمبر',
  //     'أكتوبر',
  //     'نوفمبر',
  //     'ديسمبر',
  //   ];

  //   const fmtDate = (val: any): string => {
  //     if (!val) return '—';
  //     const d = new Date(val);
  //     if (isNaN(d.getTime())) return String(val);
  //     return `${toArabicNum(d.getDate())} ${arabicMonths[d.getMonth()]} ${toArabicNum(d.getFullYear())}`;
  //   };

  //   const fmtTime = (val: any): string => {
  //     if (!val) return '—';
  //     if (val instanceof Date && !isNaN(val.getTime())) {
  //       return `${toArabicNum(val.getHours())}:${toArabicNum(val.getMinutes())}`;
  //     }
  //     const str = String(val);
  //     if (/^\d{1,2}:\d{2}/.test(str)) {
  //       const [h, m] = str.split(':');
  //       return `${toArabicNum(h)}:${toArabicNum(m)}`;
  //     }
  //     return str;
  //   };

  //   const rows = bookings.flatMap((b: any) => {
  //     const passengers = Array.isArray(b.passenger)
  //       ? b.passenger
  //       : [b.passenger].filter(Boolean);
  //     return passengers.map((p: any, i: number) => {
  //       const seatNumber = Array.isArray(b.seatNumbers)
  //         ? toArabicNum(b.seatNumbers[i])
  //         : toArabicNum(b.seatNumbers);
  //       const genderLabel =
  //         p.gender === 'MALE' ? 'ذكر' : p.gender === 'FEMALE' ? 'أنثى' : '—';
  //       return {
  //         seatNumber,
  //         name: p.name || '—',
  //         age: p.age != null ? toArabicNum(p.age) : '—',
  //         gender: genderLabel,
  //       };
  //     });
  //   });

  //   const primaryColor = '#8B5E3C';
  //   const primaryBg = '#F5EDE3';

  //   return {
  //     defaultStyle: { font: 'Tajawal', fontSize: 11, direction: 'rtl' },
  //     pageMargins: [20, 20, 20, 20],
  //     content: [
  //       {
  //         text: 'قائمة الركاب',
  //         fontSize: 18,
  //         bold: true,
  //         color: primaryColor,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 8],
  //       },
  //       {
  //         text: `${trip.fromCity || ''} ← ${trip.toCity || ''} — ${fmtDate(trip.departureDate)} ${fmtTime(trip.departureTime)}`,
  //         alignment: 'center',
  //         fontSize: 12,
  //         color: '#374151',
  //         margin: [0, 0, 0, 16],
  //       },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['*', '*', 'auto', 'auto'],
  //           body: [
  //             [
  //               {
  //                 text: 'رقم المقعد',
  //                 fillColor: primaryColor,
  //                 color: '#fff',
  //                 bold: true,
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [6, 6],
  //               },
  //               {
  //                 text: 'الاسم',
  //                 fillColor: primaryColor,
  //                 color: '#fff',
  //                 bold: true,
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [6, 6],
  //               },
  //               {
  //                 text: 'العمر',
  //                 fillColor: primaryColor,
  //                 color: '#fff',
  //                 bold: true,
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [6, 6],
  //               },
  //               {
  //                 text: 'الجنس',
  //                 fillColor: primaryColor,
  //                 color: '#fff',
  //                 bold: true,
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [6, 6],
  //               },
  //             ],
  //             ...(rows.length > 0
  //               ? rows.map((r) => [
  //                   {
  //                     text: r.seatNumber,
  //                     alignment: 'center',
  //                     fontSize: 11,
  //                     margin: [6, 4],
  //                   },
  //                   {
  //                     text: r.name,
  //                     alignment: 'center',
  //                     fontSize: 11,
  //                     margin: [6, 4],
  //                   },
  //                   {
  //                     text: r.age,
  //                     alignment: 'center',
  //                     fontSize: 11,
  //                     margin: [6, 4],
  //                   },
  //                   {
  //                     text: r.gender,
  //                     alignment: 'center',
  //                     fontSize: 11,
  //                     margin: [6, 4],
  //                   },
  //                 ])
  //               : [
  //                   [
  //                     {
  //                       text: 'لا يوجد ركاب',
  //                       alignment: 'center',
  //                       fontSize: 11,
  //                       color: '#9CA3AF',
  //                       colSpan: 4,
  //                       margin: [6, 10],
  //                     },
  //                     {},
  //                     {},
  //                     {},
  //                   ],
  //                 ]),
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           hLineColor: () => '#D1D5DB',
  //           vLineWidth: () => 1,
  //           vLineColor: () => '#D1D5DB',
  //           fillColor: (i: number) => (i > 0 && i % 2 === 0 ? primaryBg : null),
  //         },
  //       },
  //       {
  //         text: `إجمالي الركاب: ${toArabicNum(rows.length)}`,
  //         alignment: 'center',
  //         fontSize: 11,
  //         color: '#6B7280',
  //         margin: [0, 12, 0, 0],
  //       },
  //     ],
  //   };
  // }




/**
 * Rihla (رحلة) — Ticket Generator
 * pdfMake | Arabic RTL | Tajawal Font
 *
 * Usage (NestJS / Node.js):
 *   const { generateTicketBuffer } = require('./generateTicket');
 *   const buf = await generateTicketBuffer({ bus, trip, passengers, payment, bookingId });
 *   res.set({ 'Content-Type': 'application/pdf', ... });
 *   res.send(buf);
 */

// 'use strict';

// const pdfMake = require('pdfmake/build/pdfmake');
// const fs      = require('fs');
// const path    = require('path');

// ─────────────────────────────────────────────────────────────
// COLORS  (matches CSS variables)
// ─────────────────────────────────────────────────────────────
const C = {
  primary:      '#0D9488',
  textPrimary:  '#134E4A',
  primaryHover: '#0F766E',
  primaryLight: '#CCFBF1',
  primaryMuted: '#5EEAD4',
  bgBase:       '#F0FDFA',
  bgCard:       '#FFFFFF',
  border:       '#99F6E4',
  white:        '#FFFFFF',
  gray:         '#6B7280',
  lightGray:    '#F3F4F6',
  darkText:     '#1F2937',
  danger:       '#DC2626',
  warning:      '#D97706',
  success:      '#059669',
};

// ─────────────────────────────────────────────────────────────
// FONT LOADER  — loads from /backend/fonts OR local fallback
// ─────────────────────────────────────────────────────────────
function loadFontsVfs() {
  const candidates = [
    path.join(__dirname, '..', 'fonts'),            // /backend/fonts
    path.join(__dirname, 'fonts'),                  // local fonts/
  ];

  for (const dir of candidates) {
    const r = path.join(dir, 'Tajawal-Regular.ttf');
    const b = path.join(dir, 'Tajawal-Bold.ttf');
    if (fs.existsSync(r) && fs.existsSync(b)) {
      return {
        'Tajawal-Regular.ttf': fs.readFileSync(r).toString('base64'),
        'Tajawal-Bold.ttf':    fs.readFileSync(b).toString('base64'),
      };
    }
  }
  throw new Error('Tajawal fonts not found. Put them in /backend/fonts/');
}

function loadLogoBase64() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'companyLogo.png'),
    path.join(__dirname, 'assets', 'companyLogo.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// ARABIC FORMATTERS
// ─────────────────────────────────────────────────────────────
function toAr(n) {
  return String(n ?? '').replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

/** "2026-01-15" → "الخميس، ١٥ يناير ٢٠٢٦" */
function formatDate(val) {
  if (!val) return '—';
  const d = (val instanceof Date) ? val : new Date(val);
  if (isNaN(d)) return String(val);

  const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months   = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                    'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  const wd  = weekDays[d.getDay()];
  const day = toAr(d.getDate());
  const mon = months[d.getMonth()];
  const yr  = toAr(d.getFullYear());

  return `${wd}، ${day} ${mon} ${yr}`;
}

/** "07:30" or Date → "٠٧:٣٠ ص" */
function formatTime(val) {
  if (!val) return '—';
  let h, m;
  if (typeof val === 'string' && /^\d{1,2}:\d{2}/.test(val)) {
    [h, m] = val.split(':').map(Number);
  } else {
    const d = (val instanceof Date) ? val : new Date(val);
    h = d.getHours();
    m = d.getMinutes();
  }
  const period = h < 12 ? 'ص' : 'م';
  const h12    = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${toAr(String(h12).padStart(2,'0'))}:${toAr(String(m).padStart(2,'0'))} ${period}`;
}

/** 2500 → "٢٬٥٠٠ جنيه" */
function formatPrice(amount, currency = 'جنيه') {
  if (amount == null || amount === '') return '—';
  const n  = Number(amount);
  const formatted = n.toLocaleString('en');
  return `${toAr(formatted)} ${currency}`;
}

function genderLabel(g) {
  const map = { MALE:'ذكر', FEMALE:'أنثى', male:'ذكر', female:'أنثى', M:'ذكر', F:'أنثى' };
  return map[g] || g || '—';
}

function statusLabel(s) {
  const map = {
    ACTIVE:'نشطة', COMPLETED:'مكتملة', CANCELLED:'ملغاة',
    PENDING:'معلقة', CONFIRMED:'مؤكدة', DELAYED:'متأخرة',
  };
  return map[s] || s || '—';
}

function statusColor(s) {
  const map = {
    ACTIVE: C.primary, CONFIRMED: C.primary, COMPLETED: C.success,
    CANCELLED: C.danger, PENDING: C.warning, DELAYED: C.warning,
  };
  return map[s] || C.gray;
}

// ─────────────────────────────────────────────────────────────
// LAYOUT HELPERS
// ─────────────────────────────────────────────────────────────

const MARGIN = { page: [36, 36, 36, 36] };

/** Horizontal teal rule */
function rule(mt = 8, mb = 8) {
  return {
    canvas: [{ type:'line', x1:0, y1:0, x2:523, y2:0, lineWidth:0.8, lineColor: C.border }],
    margin: [0, mt, 0, mb],
  };
}

/** Section title with left accent bar */
function sectionTitle(label) {
  return {
    columns: [
      { text:'', width: 4 },
      {
        canvas: [{ type:'rect', x:0, y:0, w:4, h:18, r:2, color: C.primary }],
        width: 8, margin:[0,1,0,0],
      },
      {
        text:      label,
        font:      'Tajawal',
        bold:      true,
        fontSize:  11,
        color:     C.textPrimary,
        alignment: 'right',
      },
    ],
    columnGap: 4,
    margin:    [0, 0, 0, 6],
  };
}

/** Card with light-teal bg and border */
function card(stack, mbottom = 10) {
  return {
    table: {
      widths: ['*'],
      body:   [[{ stack, margin:[14,10,14,10] }]],
    },
    layout: {
      hLineWidth: () => 1, vLineWidth: () => 1,
      hLineColor: () => C.border, vLineColor: () => C.border,
      fillColor:  () => C.bgCard,
    },
    margin: [0, 0, 0, mbottom],
  };
}

/** Key / Value row — RTL: value right, key label left */
function kv(keyLabel, value, opts = {}) {
  return {
    columns: [
      {
        text:      String(value ?? '—'),
        font:      'Tajawal',
        bold:      opts.bold    ?? false,
        fontSize:  opts.size    ?? 10,
        color:     opts.color   ?? C.textPrimary,
        alignment: 'right',
        width:     '*',
      },
      {
        text:      keyLabel,
        font:      'Tajawal',
        bold:      true,
        fontSize:  opts.size ?? 10,
        color:     C.gray,
        alignment: 'right',
        width:     opts.kw ?? 115,
      },
    ],
    margin: [0, 2, 0, 2],
  };
}

/** Status badge pill */
function badge(text, bgColor) {
  return {
    table: {
      widths: ['auto'],
      body: [[{
        text,
        font: 'Tajawal', bold: true, fontSize: 8.5,
        color: C.white, fillColor: bgColor,
        margin: [10, 3, 10, 3], alignment: 'center',
      }]],
    },
    layout: {
      hLineWidth: ()=>0, vLineWidth: ()=>0,
      fillColor: ()=> bgColor,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION BUILDERS
// ─────────────────────────────────────────────────────────────

function buildHeader(logoBase64) {
  const logoCol = logoBase64
    ? { image: logoBase64, width: 52, height: 52, margin:[0,0,0,0] }
    : { canvas:[{type:'ellipse', x:26, y:26, r1:26, r2:26, color: C.primaryLight}], width:52 };

  return {
    stack: [
      // Teal top accent bar (full width)
      {
        canvas: [{
          type: 'rect', x:-36, y:-36, w:600, h:6, color: C.primary,
        }],
        margin: [0,0,0,0],
      },
      // Header row
      {
        columns: [
          // RIGHT: Logo + brand name
          {
            columns: [
              {
                stack: [
                  {
                    text:      'رحلة',
                    font:      'Tajawal',
                    bold:      true,
                    fontSize:  30,
                    color:     C.primary,
                    alignment: 'right',
                  },
                  {
                    text:      'تذكرة سفر رسمية',
                    font:      'Tajawal',
                    fontSize:  9.5,
                    color:     C.gray,
                    alignment: 'right',
                    margin:    [0, 1, 0, 0],
                  },
                ],
                width: '*',
                alignment: 'right',
              },
              { ...logoCol, width: 52, alignment:'left', margin:[0,0,0,0] },
            ],
            columnGap: 10,
            width: '*',
          },
        ],
        margin: [0, 10, 0, 8],
      },
      // Teal divider under header
      {
        canvas: [{
          type:'rect', x:-36, y:0, w:600, h:3, color: C.primaryLight,
        }],
        margin: [0,0,0,12],
      },
    ],
  };
}

function buildBusSection(bus) {
  if (!bus) return { text:'' };
  const plate  = bus.plateNumbers || bus.plate || {};
  const nums   = toAr(plate.numbers  || '');
  const arabic = plate.arabic  || '';
  const eng    = plate.english || '';
  const plateParts = [nums, arabic, eng].filter(Boolean).join('  |  ');

  return card([
    sectionTitle('معلومات الحافلة'),
    {
      columns: [
        kv('اسم الحافلة', bus.name || '—'),
        kv('عدد المقاعد', bus.chairs ? toAr(bus.chairs) + ' مقعداً' : '—'),
      ],
      columnGap: 12,
    },
    kv('لوحة الترقيم', plateParts || '—'),
  ]);
}

function buildTripSection(trip: any) {
  if (!trip) return { text:'' };

  const statusBg = statusColor(trip.status);
  const statusTx = statusLabel(trip.status);

  return card([
    // Title row + status badge
    {
      columns: [
        {
          stack: [sectionTitle('تفاصيل الرحلة')],
          width: '*',
        },
        {
          ...badge(statusTx, statusBg),
          alignment: 'left',
          width: 'auto',
          margin: [0,0,0,6],
        },
      ],
    },

    // ── ROUTE VISUAL ─────────────────────────────
    {
      table: {
        widths: ['*', 60, '*'],
        body: [[
          // RIGHT column — Departure
          {
            stack: [
              {
                canvas: [{
                  type:'rect', x:0, y:0, w:130, h:72, r:8,
                  color: C.bgBase,
                }],
                margin:[0,0,0,0],
              },
              { text: trip.fromCity    || '—',     font:'Tajawal', bold:true,  fontSize:15, color:C.textPrimary, alignment:'center', margin:[0,-68,0,0] },
              { text: trip.fromState   || '',       font:'Tajawal', fontSize:8.5, color:C.gray, alignment:'center' },
              { text: trip.fromStation || '',       font:'Tajawal', fontSize:8,   color:C.gray, alignment:'center', margin:[4,1,4,0] },
              { text: formatDate(trip.departureDate), font:'Tajawal', bold:true, fontSize:9.5, color:C.primary, alignment:'center', margin:[0,5,0,0] },
              { text: formatTime(trip.departureTime), font:'Tajawal', bold:true, fontSize:13,  color:C.textPrimary, alignment:'center' },
              {
                text: 'المغادرة',
                font:'Tajawal', fontSize:7.5, color:C.gray, alignment:'center',
              },
            ],
            border:[false,false,false,false],
            margin:[0,0,0,0],
          },

          // CENTER — Arrow
          {
            stack: [
              { text:'', margin:[0,10,0,0] },
              {
                canvas: [
                  { type:'line', x1:5,  y1:36, x2:50, y2:36, lineWidth:1.5, lineColor:C.primaryMuted },
                  { type:'polyline', points:[{x:5,y:31},{x:5,y:41},{x:0,y:36}], lineWidth:0, color:C.primaryMuted },
                ],
                margin:[0,0,0,0],
              },
              {
                text: '◄',
                font:'Tajawal', fontSize:8, color:C.primaryMuted,
                alignment:'center', margin:[0,-14,0,0],
              },
            ],
            border:[false,false,false,false],
            alignment:'center',
          },

          // LEFT column — Arrival
          {
            stack: [
              {
                canvas: [{
                  type:'rect', x:0, y:0, w:130, h:72, r:8,
                  color: C.bgBase,
                }],
                margin:[0,0,0,0],
              },
              { text: trip.toCity    || '—',     font:'Tajawal', bold:true,  fontSize:15, color:C.textPrimary, alignment:'center', margin:[0,-68,0,0] },
              { text: trip.toState   || '',       font:'Tajawal', fontSize:8.5, color:C.gray, alignment:'center' },
              { text: trip.toStation || '',       font:'Tajawal', fontSize:8,   color:C.gray, alignment:'center', margin:[4,1,4,0] },
              { text: formatDate(trip.arrivalDate),   font:'Tajawal', bold:true, fontSize:9.5, color:C.primary, alignment:'center', margin:[0,5,0,0] },
              { text: formatTime(trip.arrivalTime),   font:'Tajawal', bold:true, fontSize:13,  color:C.textPrimary, alignment:'center' },
              {
                text: 'الوصول',
                font:'Tajawal', fontSize:7.5, color:C.gray, alignment:'center',
              },
            ],
            border:[false,false,false,false],
            margin:[0,0,0,0],
          },
        ]],
      },
      layout: { hLineWidth:()=>0, vLineWidth:()=>0 },
      margin: [0, 0, 0, 10],
    },

    rule(4, 8),
    kv('سعر التذكرة الواحدة', formatPrice(trip.price), { bold:true, color:C.primary }),
  ]);
}

function buildPassengersSection(passengers) {
  if (!passengers || !passengers.length) return { text:'' };

  const header = [
    { text:'#',      font:'Tajawal', bold:true, fontSize:9, color:C.white, fillColor:C.primary, alignment:'center', margin:[0,4,0,4] },
    { text:'المقعد', font:'Tajawal', bold:true, fontSize:9, color:C.white, fillColor:C.primary, alignment:'center', margin:[0,4,0,4] },
    { text:'الجنس',  font:'Tajawal', bold:true, fontSize:9, color:C.white, fillColor:C.primary, alignment:'center', margin:[0,4,0,4] },
    { text:'العمر',  font:'Tajawal', bold:true, fontSize:9, color:C.white, fillColor:C.primary, alignment:'center', margin:[0,4,0,4] },
    { text:'اسم الراكب', font:'Tajawal', bold:true, fontSize:9, color:C.white, fillColor:C.primary, alignment:'right',  margin:[0,4,4,4] },
  ];

  const rows = passengers.map((p, i) => {
    const isEven = i % 2 === 0;
    const fill   = isEven ? C.bgCard : C.bgBase;
    const cell   = (txt, align='center') => ({
      text: String(txt ?? '—'), font:'Tajawal', fontSize:9,
      color:C.textPrimary, fillColor:fill,
      alignment: align, margin:[0,4,0,4],
    });
    return [
      cell(toAr(i + 1)),
      { ...cell(toAr(p.seatNumber ?? '—')), bold:true, color:C.primary },
      cell(genderLabel(p.gender)),
      cell(toAr(p.age ?? '—')),
      { ...cell(p.name || '—', 'right'), bold:true, margin:[0,4,4,4] },
    ];
  });

  return card([
    sectionTitle(`بيانات الركاب  (${toAr(passengers.length)} راكب)`),
    {
      table: {
        widths: [20, 44, 46, 38, '*'],
        headerRows: 1,
        body: [header, ...rows],
      },
      layout: {
        hLineWidth: (i)  => i <= 1 ? 1 : 0.5,
        vLineWidth: ()   => 0.5,
        hLineColor: ()   => C.border,
        vLineColor: ()   => C.border,
        paddingTop:    () => 0,
        paddingBottom: () => 0,
        paddingLeft:   () => 4,
        paddingRight:  () => 4,
      },
    },
  ]);
}

function buildPaymentSection(payment, trip) {
  if (!payment) return { text:'' };

  const singlePrice = trip?.price ?? 0;
  const platformFee = payment.platformFeeAmount ?? payment.platformFee ?? 0;
  const companyAmt  = payment.companyAmount ?? 0;
  const total       = payment.totalAmount   ?? 0;

  return card([
    sectionTitle('تفاصيل الدفع'),
    kv('سعر التذكرة الواحدة',  formatPrice(singlePrice)),
    kv('رسوم المنصة',           formatPrice(platformFee)),
    rule(4, 4),
    kv('المحول للشركة',         formatPrice(companyAmt)),
    rule(4, 4),
    {
      columns: [
        {
          text:      formatPrice(total),
          font:      'Tajawal',
          bold:      true,
          fontSize:  14,
          color:     C.primary,
          alignment: 'right',
        },
        {
          text:      'الإجمالي المدفوع',
          font:      'Tajawal',
          bold:      true,
          fontSize:  11,
          color:     C.textPrimary,
          alignment: 'right',
          width:     115,
        },
      ],
      margin: [0, 4, 0, 2],
    },
  ]);
}

function buildFooter(bookingId) {
  return {
    stack: [
      rule(6, 6),
      {
        table: {
          widths: ['*', 'auto'],
          body: [[
            {
              text: bookingId
                ? `رقم الحجز: ${bookingId}`
                : '',
              font:'Tajawal', fontSize:8, color:C.gray, alignment:'right',
              border:[false,false,false,false],
            },
            {
              text: 'رحلة — منصة حجز التذاكر',
              font:'Tajawal', fontSize:8, color:C.primary, alignment:'left',
              border:[false,false,false,false],
            },
          ]],
        },
        layout: 'noBorders',
      },
      {
        text: 'هذه التذكرة وثيقة رسمية. يُرجى الاحتفاظ بها طوال رحلتك.',
        font:'Tajawal', fontSize:7.5, color:C.gray, alignment:'center', margin:[0,3,0,0],
      },
      // Bottom teal stripe
      {
        canvas: [{ type:'rect', x:-36, y:6, w:600, h:4, color:C.primaryLight }],
        margin: [0,4,0,0],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

/**
 * @param {{ bus, trip, passengers, payment, bookingId }} ticketData
 * @returns {Promise<Buffer>}  PDF as a Node.js Buffer
 */
async function generateTicketBuffer(ticketData) {
  const { bus, trip, passengers, payment, bookingId } = ticketData;

  // Load fonts into pdfmake VFS
  const vfs = loadFontsVfs();
  pdfMake.addVirtualFileSystem(vfs);
  pdfMake.fonts = {
    Tajawal: {
      normal:  'Tajawal-Regular.ttf',
      bold:    'Tajawal-Bold.ttf',
      italics: 'Tajawal-Regular.ttf',
    },
  };

  const logoBase64 = loadLogoBase64();

  const docDefinition = {
    pageSize:        'A4',
    pageOrientation: 'portrait',
    pageMargins:     MARGIN.page,

    defaultStyle: {
      font:      'Tajawal',
      fontSize:  10,
      color:     C.textPrimary,
      alignment: 'right',
    },

    // Light teal page background
    background: (currentPage, pageSize) => ({
      canvas: [{
        type:'rect', x:0, y:0,
        w: pageSize.width, h: pageSize.height,
        color: C.bgBase,
      }],
    }),

    content: [
      buildHeader(logoBase64),
      buildBusSection(bus),
      buildTripSection(trip),
      buildPassengersSection(passengers),
      buildPaymentSection(payment, trip),
      buildFooter(bookingId),
    ],
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc.getBuffer();
}

module.exports = { generateTicketBuffer };

// ─────────────────────────────────────────────────────────────
// DEMO — node generateTicket.js
// ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const sampleData = {
    bookingId: 'BK-20260115-00142',

    bus: {
      name:         'سوبر جيت — خط الخرطوم',
      plateNumbers: { numbers: '٣٦٧٢١', arabic: 'أ ب ت', english: 'KRT' },
      chairs:       44,
    },

    trip: {
      departureDate:  '2026-01-15',
      departureTime:  '07:30',
      arrivalDate:    '2026-01-15',
      arrivalTime:    '13:45',
      fromState:      'ولاية الخرطوم',
      fromCity:       'الخرطوم',
      fromStation:    'محطة الشهداء المركزية',
      toState:        'ولاية البحر الأحمر',
      toCity:         'بورتسودان',
      toStation:      'محطة بورتسودان الرئيسية',
      price:          2500,
      status:         'CONFIRMED',
    },

    passengers: [
      { name: 'أحمد محمد علي',    age: 32, gender: 'MALE',   seatNumber: 12 },
      { name: 'فاطمة أحمد حسن',   age: 28, gender: 'FEMALE', seatNumber: 13 },
      { name: 'محمد عبدالله خالد', age: 8,  gender: 'MALE',   seatNumber: 14 },
    ],

    payment: {
      platformFeeAmount: 150,
      companyAmount:     7350,
      totalAmount:       7500,
    },
  };

  generateTicketBuffer(sampleData).then(buf => {
    const outPath = path.join(__dirname, 'rihla-ticket.pdf');
    fs.writeFileSync(outPath, buf);
    console.log('✅  Ticket saved →', outPath, `(${(buf.length/1024).toFixed(1)} KB)`);
  }).catch(e => {
    console.error('❌  Error:', e.message);
    process.exit(1);
  });
}



}
