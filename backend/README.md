# Ethiopian Recipe Share - Backend

A simplified backend for the Ethiopian Recipe Share application with phone number OTP authentication.

## Features

- Phone number based authentication with OTP
- JWT based authentication
- User profile management
- MongoDB database integration
- Environment based configuration

## Prerequisites

- Node.js (v16 or later)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ethiopian-recipe-share/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   # Development
   npm run start:dev

   # Production build
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication

- `POST /auth/request-otp` - Request OTP for phone number
  ```json
  {
    "phoneNumber": "+251911223344"
  }
  ```

- `POST /auth/verify-otp` - Verify OTP and get JWT token
  ```json
  {
    "phoneNumber": "+251911223344",
    "otp": "123456"
  }
  ```

### User Profile

- `GET /auth/profile` - Get current user profile (requires authentication)
- `POST /auth/profile` - Update user profile (requires authentication)
  ```json
  {
    "name": "User Name"
  }
  ```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Project Structure

```
src/
├── auth/                    # Authentication related code
│   ├── auth.controller.ts    # Authentication endpoints
│   ├── auth.dto.ts          # Data transfer objects for auth
│   ├── auth.module.ts       # Auth module definition
│   ├── auth.service.ts      # Auth business logic
│   ├── guards/              # Auth guards
│   └── strategies/          # Passport strategies
├── user/                    # User related code
│   ├── user.schema.ts       # User model definition
│   ├── user.service.ts      # User business logic
│   └── user.module.ts       # User module definition
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## Development

- Run linter: `npm run lint`
- Run tests: `npm test`
- Format code: `npm run format`

## License

MIT
