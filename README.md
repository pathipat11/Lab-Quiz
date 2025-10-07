# Lab-Quiz-Hybrid-Mobile

A modern hybrid mobile app built with **Expo + React Native + Expo Router** that showcases:

* 🔐 Token-based authentication with optional **biometric unlock**
* 👤 User profile view & edit
* 📰 Social-style **Feed** (post / like / comment) with optimistic UI
* 🎓 **Class year directory** with search & chips
* 🌗 Global **Light/Dark** theme with a glossy toggle
* 🧭 Polished bottom bar + auth avatar menu

This README documents the project structure, setup, configuration, core screens, services, and tips.

---

## ✨ Key Features

* **Auth flow**: Sign in → fetch profile → store token & user in AsyncStorage → gated routes
* **Biometrics**: Optional biometric check after sign-in (`useBiometricAuth`)
* **Profile**: View, quick stats, school/advisor sections, and modal edit form
* **Feed**: Create post, like/unlike (optimistic), comment, delete own post/comment, friendly time-ago
* **Class Directory**: Filter by year (dynamic route `/class/[year]`), quick search across name/email/ID
* **Theming**: Context-driven colors, glossy `ThemeToggle`, consistent drop shadows (iOS & Android)
* **BottomBar**: Minimal IG-like bottom nav + avatar (or initials) + profile popover menu

---

## 🧱 Tech Stack

* **React Native** + **Expo** (SDK 51+)
* **Expo Router** for file-based navigation
* **AsyncStorage** for token & profile persistence
* **Context API** for theme management
* **Animated API** for micro-interactions
* **react-native-vector-icons** for crisp icons

---

## 📁 Project Structure

```bash
Lab-Quiz-Hybrid-Mobile/
├─ app/
│  ├─ components/
│  │  ├─ BottomBar.tsx          # IG-style bottom nav with active dot & avatar
│  │  ├─ ThemeToggle.tsx        # Glossy toggle with animated knob
│  │  └─ AuthToggle.tsx         # Avatar/initials + popover (profile/logout)
│  │
│  ├─ feed/
│  │  ├─ index.tsx              # Feed list (create/like/comment/delete)
│  │  └─ [id].tsx               # Feed detail with comments & composer
│  │
│  ├─ class/
│  │  └─ [year].tsx             # Class directory by year + search
│  │
│  ├─ profile/
│  │  ├─ index.tsx              # Profile overview + stats + edit modal
│  │  └─ profileEdit.tsx        # (Optional) dedicated edit screen
│  │
│  ├─ signin/
│  │  └─ index.tsx              # Sign-in with biometrics + token store
│  │
│  ├─ main.tsx                  # Home hub (cards/shortcuts/grid)
│  └─ _layout.tsx               # Router layout + theme/app providers
│
├─ context/
│  └─ ThemeContext.tsx          # Theme colors & toggle
│
├─ hooks/
│  └─ useBiometricAuth.ts       # Local auth hook (Face/Touch/Passcode)
│
├─ services/
│  ├─ authService.ts            # login/getProfile/updateProfile
│  ├─ classService.ts           # getMembersByYear
│  └─ statusService.ts          # list/create/like/unlike/comments
│
├─ assets/
│  └─ image/
│     └─ profile.jpg            # Default avatar fallback
│  └─ videos/
│     └─ demo.mp4               # Example app demo video
│
├─ app.json                     # Expo config (inject API URL)
├─ package.json
└─ README.md
```

---

## 🎬 Demo Video

Below is a quick demo showing navigation, feed posting, and theme toggle:

<img src="assets/videos/demo.gif" alt="App Demo" width="260" />

Alternatively, you can include your `.mp4` demo:

```markdown
<video src="assets/videos/demo.mp4" width="300" controls></video>
```

> Replace `assets/videos/demo.mp4` with your own exported demo file.

---

## 🔧 Configuration

### 1) API base URL via **Expo extra**

Add your backend URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.example.com"
    }
  }
}
```

Access it anywhere via:

```ts
import Constants from "expo-constants";
const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";
```

> All service calls (`authService`, `statusService`, `classService`) rely on this base.

---

## 🚀 Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Run the project
npx expo start
# Then scan the QR code with Expo Go or run on emulator
```

**Recommended versions**:

* Node.js ≥ 18
* Expo CLI ≥ 7

---

## 👤 Author

**Pathipat Mattra**
Facebook: [Pathipat Mattra](https://facebook.com/pathipat.mattra)
GitHub: [pathipat11](https://github.com/pathipat11)
LinkedIn: [Pathipat Mattra](https://linkedin.com/in/viixl)

---

Crafted with ❤️ for the course **Hybrid Mobile Application Programming (IN405109)**
Faculty of Science, **Computer Science - Khon Kaen University**
