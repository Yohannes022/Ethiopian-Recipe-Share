# Ethiopian Recipe Share Backend

This is the backend API for the Ethiopian Recipe Share application.

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Main application configuration
│   ├── config/               # Configuration files
│   ├── controllers/          # API controllers
│   ├── interfaces/           # TypeScript interfaces
│   ├── middleware/           # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── views/               # Email templates
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ethiopian-recipe-share
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Start the production server:
   ```bash
   npm start
   ```
