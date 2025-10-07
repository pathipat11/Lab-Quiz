# Local-authentication-Section7

A secure and interactive authentication system built using **React Native**, **Expo**, and **Expo Router**. This app provides **local authentication** with token-based session management, offering a smooth login and sign-up experience with real-time validation and a modern UI supporting both light and dark modes.

## ✨ Features

* 🔐 **Local Authentication**: Sign In / Sign Up with secure token storage using AsyncStorage
* 🧠 **Conditional Routing**: Automatically redirect users based on authentication status
* 👤 **User Profile**: Display user information after login
* 🌗 **Theme Toggle**: Switch between Dark and Light mode using Context API
* 💬 **Interactive UI**: Smooth animations and responsive design for mobile devices
* 📝 **Form Validation**: Real-time feedback for username, email, and password
* 📱 **Mobile Optimized**: Fully functional on smartphones and tablets

## 🎬 Demo Video

Here is a quick GIF showing the app's interface and authentication flow:

<img src="assets/videos/local-auth-demo.gif" alt="App Demo" width="250" />

*Replace `assets/videos/local-auth-demo.gif` with your GIF file path.*

## 🛠️ Tech Stack

* React Native
* Expo
* Expo Router
* Context API
* AsyncStorage for token persistence
* React Native Vector Icons
* Animated API for smooth interactions

## 🚀 Getting Started

### Prerequisites

* Node.js
* Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
npm install
```

### Running the App

```bash
npx expo start
```

Then scan the QR code with **Expo Go** or use an emulator.

## 🔄 Project Structure

```
Local-authentication-Section7/
├── app/
│   └── components/
│       ├── ThemeToggle.tsx     # Toggle Dark/Light mode
│       └── AuthForm.tsx        # Form component for Sign In/Sign Up
│   └── profile/                # User profile screen
│       ├── index.tsx
│       └── profileEdit.tsx
│   └── signin/                 # Sign In screen
│   └── signup/                 # Sign Up screen
│   ├── _layout.tsx             # Stack Navigation with Theme + Auth Context
│   ├── about.tsx
│   ├── book.tsx
│   ├── bookDetail.tsx
│   ├── bookEdit.tsx
│   ├── bookNew.tsx
│   ├── index.tsx               # Redirects based on auth token
│   ├── main.tsx                # Main page after login
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx        # Theme state management
├── hooks/
│   ├── useAuth.ts
│   └── useBiometricAuth.ts
├── serviecs/
│   ├── api.ts
│   └── authService.ts
├── types/
│   ├── book.ts
│   └── user.ts
├── assets/
│   └── videos/
│       └── local-auth-demo.gif   # Demo GIF
├── package.json
└── README.md
```

## 🧩 Example Code

Here's a small snippet showing **Sign In** with token storage using AsyncStorage:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleSignIn = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      await AsyncStorage.setItem('authToken', data.token);
      navigation.replace('main');
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Sign In failed.');
  }
};
```

## 👤 Author

**Pathipat Mattra**

* 🌐 Facebook: [Pathipat Mattra](https://facebook.com/pathipat.mattra)
* 💻 GitHub: [pathipat11](https://github.com/pathipat11)
* 💼 LinkedIn: [Pathipat Mattra](https://linkedin.com/in/viixl)

---

Crafted with ❤️ for the course *Hybrid Mobile Application Programming* (**IN405109**)
**Computer Science, Khon Kaen University**
