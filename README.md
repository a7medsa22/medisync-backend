## 🏥 MediSync API

**MediSync** is a **Medical follow-up & Records Management System** built with **NestJS**, designed to streamline healthcare processes between doctors and patients.  
MediSync aims to simplify doctor-patient interactions and provide secure digital healthcare management.  
It provides secure authentication, appointment booking, prescription management, and communication modules — all under a modular, scalable backend architecture.

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


## 🚀 Features

- 👤 Role-based Authentication (Doctor / Patient)
- 💊 Prescription Creation & Sharing
- 🔗 Connection Requests between Doctors & Patients
- 🩺 Medical Specializations Management
- 🧾 QR Code Verification for Prescriptions
- 🛡️ Secure endpoints with JWT & Guards
- 🧠 Modular and Scalable Architecture using NestJS

----

## 🧠 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Language** | TypeScript |
| **Framework** | [NestJS](https://nestjs.com/) |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT, bcrypt |
| **API Docs** | Swagger (OpenAPI 3.0) |
| **Validation** | class-validator & class-transformer |
| **Deployment (optional)** | Render / Railway |
| **Testing Tools** | Postman Collection |

---


## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication & Authorization
├── users/                  # User management (base)
├── specializations/       # Medical specializations
├── prescriptions/         # Prescription management
├── notifications/         # Real-time notifications
├── Request/               # Connection requests between doctors and patients
├── config/                # Application configuration
├── email/                # Email configuration
├── QR/              # QR code generation & verification
├── common/              # Shared utilities, guards, decorators
└── prisma/              # Prisma schema & migrations 
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

---

## ⚙️ Getting Started

#  Clone the Repository

```bash
# Clone repository
git clone https://github.com/ahmedsalah/MediSync-API.git
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
---

# ⚙️ Environment Configuration

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

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### 📘 API Endpoints

## 🖼️ Swagger UI Preview

Below are screenshots from the live Swagger documentation:

| Module | Preview |
|--------|----------|
| Authentication | ![Swagger Authentication](./docs/swagger-auth.png) |
| Users | ![Swagger Users](./docs/swagger-users.png) |
| Prescriptions | ![Swagger Prescriptions](./docs/swagger-prescriptions.png) |
| Specializations | ![Swagger Specializations](./docs/swagger-specializations.png) |
| Connection Requests | ![Swagger Connection Requests](./docs/swagger-requests.png) |
| Qr | ![Swagger Qr](./docs/swagger-qr.png) |

Each module contains detailed schemas, responses, and error examples.

--- 

## 🧩 Authentication Schemas

Below are the main **Data Transfer Objects (DTOs)** used across the MediSync API.  
Each schema defines the structure and validation rules for the request/response payloads.


| DTO | Description |
|-----|--------------|
| **RegisterInitDto** | Step 1: Select role (Doctor / Patient) during registration |
| **RegisterBasicDto** | Step 2: Submit basic info (email, password, name, etc.) |
| **RegisterVerifyEmailDto** | Step 3: Verify user’s email using OTP |
| **LoginDto** | User login with email and password |
| **ForgotPasswordDto** | Request password reset via email |
| **VerifyOtpDto** | Verify OTP for password reset |
| **ResetPasswordDto** | Set new password after OTP verification |
| **ResendOtpDto** | Resend verification OTP |
| **RefreshTokenDto** | Refresh access token using refresh token |
| **ChangePasswordDto** | Change current password (authenticated users) |

---

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
- Role-based access control
- Email notifications for important events
- QR code generation & verification
- Connection requests between doctors and patients
- Notifications system for events like appointment confirmations, requests, and messages
- Chat system for real-time communication between doctors and patients
- File upload/download for medical records


### Phase 2 (Enhanced)
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

🧑‍💻 Live Swagger Docs (Demo): https://medisync-api.onrender.com/api-docs

**Built with ❤️ for better healthcare management**