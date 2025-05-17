# Welcome to your Expo app 👋

# Restaurant Management System

This project is a full-stack restaurant management system with a React Native frontend and a FastAPI Python backend.

## Features

- User authentication (customers, restaurant owners, managers)
- Restaurant management
- Menu management
- Order processing
- Recipe management
- Analytics and reporting
- Customer management

## Tech Stack

### Frontend
- React Native with Expo
- Zustand for state management
- React Navigation for routing
- Axios for API requests

### Backend
- FastAPI (Python)
- JSON file-based data storage (for demo purposes)
- Analytics capabilities

## Getting Started

### Prerequisites
- Node.js
- Python 3.7+
- Expo CLI

### Installation

1. Clone the repository
2. Install frontend dependencies:
```
npm install
```

3. Install backend dependencies:
```
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```
cd backend
uvicorn main:app --reload
```

2. Start the frontend:
```
npx expo start
```

## Backend API

The backend provides the following API endpoints:

- `/api/users/register` - Register a new user
- `/api/auth/verify-otp` - Verify OTP for user registration
- `/api/auth/resend-otp` - Resend OTP
- `/api/auth/login` - User login
- `/api/restaurants` - CRUD operations for restaurants
- `/api/restaurants/{restaurant_id}/menu` - CRUD operations for menu items
- `/api/orders` - CRUD operations for orders
- `/api/recipes` - CRUD operations for recipes
- `/api/analytics/restaurant/{restaurant_id}` - Get restaurant analytics

## Data Storage

The system uses JSON files for data storage:

- `data/users.json` - User data
- `data/restaurants.json` - Restaurant data
- `data/recipes.json` - Recipe data
- `data/orders.json` - Order data

In a production environment, this would be replaced with a proper database.

## Analytics

The system includes analytics capabilities for restaurant owners:

- Sales trends
- Popular menu items
- Customer demographics
- Order patterns

This can be extended with more advanced data science concepts like:

- Predictive analytics for demand forecasting
- Menu optimization based on popularity and profitability
- Customer segmentation and personalized marketing
- Inventory management optimization

## License

This project is licensed under the MIT License.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# Ethiopian-Recipe-Share

