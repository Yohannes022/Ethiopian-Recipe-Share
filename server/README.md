# Ethiopian Recipe Share - Backend API

This is the backend API for the Ethiopian Recipe Share application, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, logout)
- Restaurant management (CRUD operations)
- Menu item management
- Order processing
- Role-based access control
- JWT authentication
- Rate limiting and security best practices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/ethiopian-recipe-share.git
   cd ethiopian-recipe-share/server
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env`

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The API will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ethiopian-recipes

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password
- `POST /api/v1/auth/forgotpassword` - Forgot password
- `PUT /api/v1/auth/resetpassword/:resettoken` - Reset password

### Restaurants

- `GET /api/v1/restaurants` - Get all restaurants
- `GET /api/v1/restaurants/:id` - Get single restaurant
- `POST /api/v1/restaurants` - Create new restaurant (Admin/Owner only)
- `PUT /api/v1/restaurants/:id` - Update restaurant (Admin/Owner only)
- `DELETE /api/v1/restaurants/:id` - Delete restaurant (Admin/Owner only)

### Menu Items

- `GET /api/v1/menu` - Get all menu items
- `GET /api/v1/menu/restaurant/:restaurantId` - Get menu items by restaurant
- `GET /api/v1/menu/:id` - Get single menu item
- `POST /api/v1/menu` - Create new menu item (Admin/Owner only)
- `PUT /api/v1/menu/:id` - Update menu item (Admin/Owner only)
- `DELETE /api/v1/menu/:id` - Delete menu item (Admin/Owner only)

### Orders

- `GET /api/v1/orders` - Get all orders (Admin/Owner)
- `GET /api/v1/orders/myorders` - Get logged in user orders
- `GET /api/v1/orders/:id` - Get single order
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id` - Update order status (Admin/Owner)

## Error Handling

The API follows RESTful conventions for error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Security

- Helmet for setting various HTTP headers
- Rate limiting (100 requests per 10 minutes)
- Data sanitization against NoSQL injection and XSS
- CORS enabled for configured origins
- JWT with HTTP-only cookies for authentication

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Make sure MongoDB is properly configured
3. Install production dependencies:
   ```bash
   npm install --production
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
