````markdown name=README.md url=https://github.com/shaiba97/Rihla/blob/main/README.md
# Rihla - Bus Booking Platform

A comprehensive bus booking ticket system built with a modern microservices architecture. Rihla enables users to search, book, and manage bus tickets with real-time updates.

## 📋 Project Overview

Rihla is a full-stack application for bus ticket booking with three main user roles:
- **Customers**: Browse and book bus tickets
- **Companies**: Manage buses, routes, and trips
- **Admin**: Monitor platform activity and manage system-wide operations

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Framework**: NestJS (Node.js framework)
- **Runtime**: Node.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT + Passport
- **Logging**: Pino

**Frontend:**
- **Admin Portal**: Angular 21.2.7 + Tailwind CSS
- **Company App**: Angular 21.2.7 + Tailwind CSS + Capacitor (Mobile)
- **Customer App**: Angular 21.2.7 + Tailwind CSS + Capacitor (Mobile)

**Infrastructure:**
- Package Manager: npm 11.12.0+
- TypeScript 5.9+
- ESLint + Prettier for code quality

### Microservices Structure

```
backend/
├── apps/
│   ├── admin/          # Admin service (port 3000)
│   ├── company/        # Company service (port 3001)
│   └── customer/       # Customer service (port 3002)
├── libs/
│   ├── auth/          # Authentication logic
│   ├── common/        # Shared utilities
│   ├── prisma/        # Database config
│   ├── redis/         # Cache service
│   ├── pdf/           # PDF generation
│   └── websocket/     # WebSocket adapter
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 11.12.0+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/shaiba97/Rihla.git
   cd Rihla
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend apps
   cd ../admin && npm install
   cd ../company && npm install
   cd ../customer && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy example env file
   cp .env.example .env

   # Update with your configuration
   # Required variables:
   # - DATABASE_URL
   # - REDIS_HOST, REDIS_PORT
   # - JWT_SECRET
   # - CORS_ORIGINS
   ```

4. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed  # Optional: load sample data
   ```

5. **Start Services**
   ```bash
   # Backend - all services
   cd backend
   npm run start:all

   # Or individual services
   npm run start:company  # Port 3001
   npm run start:customer # Port 3002
   npm run start:admin    # Port 3000

   # Frontend (in separate terminals)
   cd admin && npm start     # http://localhost:4000
   cd company && npm start   # http://localhost:4200
   cd customer && npm start  # http://localhost:4100
   ```

## 📝 Environment Variables

See `.env.example` for all available variables. Key configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rihla

# Ports
ADMIN_PORT=3000
COMPANY_PORT=3001
CUSTOMER_PORT=3002

# CORS
CORS_ORIGINS=http://localhost:4000,http://localhost:4100,http://localhost:4200

# Security
JWT_SECRET=your-secret-key-here
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Upload
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=52428800
```

## 🔧 Development

### Build

```bash
# Backend
cd backend
npm run build                  # Build all services
npm run build:admin           # Build admin only
npm run build:company         # Build company only
npm run build:customer        # Build customer only

# Frontend
cd admin && npm run build
cd company && npm run build
cd customer && npm run build
```

### Testing

```bash
# Backend unit tests
cd backend
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format
```

### Debug

```bash
# Backend debug mode
cd backend
npm run start:debug:all

# With specific service
npm run start:debug:admin      # Debug on port 9229
npm run start:debug:company
npm run start:debug:customer
```

## 📦 Deployment

### Production Build

```bash
cd backend
npm run build:company
npm run build:customer
npm run build:admin
```

### Production Start

```bash
npm run start:prod
```

## 🔐 Security

- **JWT Authentication**: Token-based API authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS**: Configurable origins via environment
- **Input Validation**: class-validator for request validation
- **Type Safety**: Strict TypeScript mode enabled
- **Environment Secrets**: All sensitive data in `.env`

## 📚 API Documentation

Swagger documentation available at:
- Admin: `http://localhost:3000/api/docs`
- Company: `http://localhost:3001/api/docs`
- Customer: `http://localhost:3002/api/docs`

## 🗄️ Database

### Schema
- Managed with Prisma ORM
- Migrations in `backend/prisma/migrations/`
- Schema defined in `backend/prisma/schema.prisma`

### Key Tables
- Users (customers, companies, admins)
- Buses & Routes
- Trips & Bookings
- Payments & Transactions
- Notifications

## 📱 Mobile Apps

Both Company and Customer apps support mobile deployment via Capacitor:

```bash
# iOS
cd company && npm run ios
cd customer && npm run ios

# Android
cd company && npm run android
cd customer && npm run android
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Open Pull Request

## 📋 Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Formatting**: Run `npm run format` before commit
- **Testing**: Write tests for new features

## 🐛 Troubleshooting

### Services won't start
- Check `.env` file is configured
- Verify PostgreSQL and Redis are running
- Check ports 3000-3002 are available

### Database migration fails
- Ensure DATABASE_URL is correct
- Check PostgreSQL connection
- Run `npx prisma db push` if needed

### Port conflicts
- Modify `ADMIN_PORT`, `COMPANY_PORT`, `CUSTOMER_PORT` in `.env`
- Restart services after change

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- Create a GitHub issue
- Email: support@rihla.dev
- Discord: [Join our community](https://discord.gg/rihla)

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced booking analytics
- [ ] Seat selection UI
- [ ] Refund management system
- [ ] Rating & review system

---

**Last Updated**: May 2026
**Version**: 0.0.1
````
