## 🏥 MediSync - Medical Appointment & Records Management System

A comprehensive healthcare management platform built with NestJS that streamlines medical appointments, patient records, and healthcare workflows.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


## 🚀 Overview

MediSync is a modern medical management system that connects patients, doctors, and hospital administrators through a unified platform. The system provides secure appointment booking, medical record management, and real-time healthcare coordination.

## ✨ Key Features

### For Patients
- **Secure Registration** with ID verification
- **Smart Appointment Booking** with conflict detection
- **Medical History Access** - view all records and reports
- **Document Upload** - lab results, X-rays, medical reports
- **Real-time Notifications** - appointment updates and reminders

### For Doctors  
- **Schedule Management** - view and manage appointments
- **Patient Records** - comprehensive medical history access
- **Report Generation** - create and update patient records
- **Specialization-based Organization** - organized by medical specialties

### For Administrators
- **User Verification** - approve patient registrations with ID validation
- **System Management** - doctors, specializations, and hospital branches
- **Analytics Dashboard** - insights and performance metrics
- **Complete Oversight** - manage all platform activities

## 🛠️ Tech Stack

- **Backend Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with Refresh Tokens
- **File Storage:** Cloudinary / AWS S3 (configurable)
- **Real-time:** WebSocket for notifications
- **Security:** Helmet, Rate Limiting, Data Validation

## 📋 Core Modules

```
├── Authentication & Authorization (JWT + Role-based)
├── User Management (Patients, Doctors, Admins)
├── Appointment System (Booking, Scheduling, Conflicts)
├── Medical Records (History, Reports, Files)
├── File Management (Upload, Storage, Retrieval)
├── Notifications (Real-time updates)
└── Admin Dashboard (Analytics, Management)
```

## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication & Authorization
├── users/                  # User management (base)
├── patients/              # Patient-specific features
├── doctors/               # Doctor-specific features
├── appointments/          # Appointment booking system
├── medical-records/       # Medical history & reports
├── specializations/       # Medical specializations
├── files/                 # File upload & management
├── notifications/         # Real-time notifications
├── admin/                 # Admin dashboard & management
├── common/                # Shared utilities, guards, decorators
├── config/                # Application configuration
└── database/              # Prisma schema & migrations
```
---
### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/medisync_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application Configuration
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DEST="./uploads"

# Cloudinary Configuration (Optional)
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"
SMTP_FROM="MediSync <noreply@medisync.com>"

# Rate Limiting
THROTTLE_TTL=60  # seconds
THROTTLE_LIMIT=100  # requests per TTL

# Security
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
COOKIE_SECRET="your-cookie-secret-key"
```
---

## 🔐 Security Features

- **JWT Authentication** with refresh token rotation
- **Role-based Access Control** (RBAC)
- **Data Validation** with class-validator
- **Rate Limiting** to prevent abuse
- **Helmet Security Headers**
- **CORS Configuration**
- **Input Sanitization**
- **Audit Logging** for sensitive operations

## 📊 Database Schema

Built with Prisma ORM featuring:
- **User Management** with status-based verification
- **Medical Records** with flexible document attachments  
- **Appointment Scheduling** with conflict prevention
- **Role-based Architecture** for different user types
- **Audit Trails** for compliance and tracking

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation
```bash
# Clone repository
git clone [repository-url]
cd medisync-backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Configure your database and other environment variables

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development server
npm run start:dev
```

## 🧪 API Documentation

The API follows RESTful conventions with the following main endpoints:

```
Authentication:
POST /auth/register          # User registration
POST /auth/login            # User login
POST /auth/refresh          # Refresh tokens

Appointments:
GET /appointments           # List appointments
POST /appointments          # Book appointment
PUT /appointments/:id       # Update appointment
DELETE /appointments/:id    # Cancel appointment

Medical Records:
GET /medical-records        # Patient medical history
POST /medical-records       # Add new record
PUT /medical-records/:id    # Update record
```

## 🔄 Development Workflow

This project follows agile development principles with:
- **MVP-first approach** - core features first
- **Iterative development** - continuous improvement
- **Team collaboration** - frontend/backend coordination
- **Quality assurance** - testing and code review

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- User authentication & verification
- Basic appointment booking
- Medical record management
- Admin user management

### Phase 2 (Enhanced)
- Real-time chat system
- Advanced file management
- Detailed analytics
- Mobile API optimization

### Phase 3 (Advanced)
- Telemedicine integration
- AI-powered insights
- Multi-language support
- Third-party integrations

## 📈 Performance & Scalability

- **Database Optimization** with proper indexing
- **Caching Strategy** with Redis
- **File Storage** optimized for medical documents
- **API Rate Limiting** for stability
- **Connection Pooling** for database efficiency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for better healthcare management**