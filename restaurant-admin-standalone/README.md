# Restaurant Admin Dashboard

A standalone restaurant management application built with Expo, React Native, and TypeScript. This application allows restaurant owners and managers to manage their menu, orders, customers, and view analytics.

## Features

- 🍽️ Menu Management - Add, edit, and remove menu items
- 📊 Analytics - View sales and customer insights
- 📦 Order Management - Track and manage customer orders
- 👥 Customer Management - View customer information and order history
- ⚙️ Settings - Configure your restaurant details and preferences

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS development: Xcode (Mac only)
- For Android development: Android Studio

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-admin-standalone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_API_URL=your_api_url_here
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run the app**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with the Expo Go app on your physical device

## Project Structure

```
restaurant-admin-standalone/
├── app/                     # App routes and screens
│   ├── (app)/               # Authenticated app screens
│   │   └── (restaurant)/    # Restaurant management screens
│   │       ├── index.tsx    # Dashboard
│   │       ├── menu.tsx     # Menu management
│   │       ├── orders.tsx   # Order management
│   │       └── ...
│   ├── (auth)/             # Authentication screens
│   │   └── login.tsx       # Login screen
│   └── _layout.tsx         # Root navigation layout
├── assets/                 # Static assets (images, fonts, etc.)
├── components/             # Reusable UI components
├── constants/              # App constants (colors, typography, etc.)
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── lib/                    # API and utility functions
├── store/                  # State management (Zustand stores)
└── types/                  # TypeScript type definitions
```

## Available Scripts

- `npm start` or `yarn start` - Start the development server
- `npm run android` or `yarn android` - Run on Android
- `npm run ios` or `yarn ios` - Run on iOS
- `npm run web` or `yarn web` - Run on web
- `npm run lint` or `yarn lint` - Run ESLint

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_API_URL=your_api_url_here
```

### App Configuration

Edit `app.json` to configure your app's name, icon, splash screen, and other settings.

## Dependencies

### Main Dependencies

- `expo` - Framework for building cross-platform apps
- `expo-router` - File-based routing for Expo
- `react` and `react-native` - Core libraries
- `zustand` - State management
- `axios` - HTTP client
- `lucide-react-native` - Icons
- `react-native-reanimated` - Smooth animations

### Development Dependencies

- `typescript` - Type checking
- `@types/react` - TypeScript types for React
- `eslint` - Code linting

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository.
