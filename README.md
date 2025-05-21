# Ethiopian Recipe Share

![App Banner](assets/images/app-banner.png)

A modern mobile application for discovering, sharing, and cooking authentic Ethiopian recipes. Connect with a community of food enthusiasts and explore the rich culinary heritage of Ethiopia.

## ✨ Features

- **Recipe Discovery**: Browse a vast collection of authentic Ethiopian recipes
- **User Profiles**: Create and customize your profile, save favorite recipes
- **Recipe Sharing**: Share your own recipes with the community
- **Step-by-Step Cooking**: Detailed cooking instructions with timers
- **Grocery Lists**: Generate shopping lists from recipe ingredients
- **Offline Access**: Save recipes for offline use
- **Search & Filter**: Find recipes by ingredients, cooking time, or dietary preferences

## 🚀 Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation
- **UI Components**: NativeWind for styling
- **Icons**: Lucide Icons
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js with Express
- **Authentication**: JWT
- **Database**: MongoDB
- **API**: RESTful endpoints
- **File Storage**: Cloudinary / Local Storage

## 📱 App Structure

```
.
├── app/                    # Frontend React Native app
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Main app tabs
│   │   ├── explore/        # Recipe discovery
│   │   ├── saved/          # Saved recipes
│   │   ├── create/         # Recipe creation
│   │   └── profile/        # User profile
│   ├── components/         # Reusable components
│   ├── constants/          # App constants
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   ├── services/           # API services
│   ├── store/              # State management
│   └── types/              # TypeScript types
│
└── server/                # Backend server
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── middleware/        # Custom middleware
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── services/          # Business logic
    ├── utils/             # Utility functions
    ├── .env               # Environment variables
    └── server.js          # Server entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Python 3.9+ (for backend)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ethiopian-recipe-share.git
   cd ethiopian-recipe-share
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in both root and server directories
   - Update the environment variables as needed
   - Make sure MongoDB is running locally or update the connection string in `.env`

### Running the App

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000` by default

2. **Start the frontend**
   ```bash
   # From the project root
   npx expo start
   ```

3. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)
   - Scan QR code with Expo Go (iOS/Android)

## 📚 Documentation

### API Documentation

Once the backend is running, access the interactive API documentation at:
- API Documentation: `http://localhost:5000/api-docs`
- API Base URL: `http://localhost:5000/api`

### State Management

The app uses Zustand for state management. Key stores include:

- `useAuthStore`: Authentication state
- `useRecipeStore`: Recipe data and operations
- `useProfileStore`: User profile and preferences

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ethiopian culinary experts and home cooks
- Open source community for amazing tools and libraries
- All contributors who help improve this project

---

Made with ❤️ by [Your Name] | [Website](https://your-website.com)

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# Ethiopian-Recipe-Share

