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
│
├─ app.json                     # Expo config (inject API URL)
├─ package.json
└─ README.md
```

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

### 2) Token & Profile Persistence

* On successful sign-in, save `authToken` & `user` (profile) to **AsyncStorage**.
* Protected flows fetch `/profile` to hydrate UI + avatar/initials.

---

## 🚀 Getting Started

```bash
# 1) Install
npm install

# 2) Start dev server
npx expo start
# Open on device via Expo Go or run emulator
```

**Recommended versions** (adjust to your environment):

* Node.js ≥ 18
* Expo CLI ≥ 7

---

## 🔐 Authentication Flow

1. **Sign In** (`app/signin/index.tsx`)

   * Validates fields, calls `login(email, password)` → receives `{ token }`
   * Stores token, fetches `/profile` → saves to `AsyncStorage`
   * (Optional) **Biometric prompt** via `useBiometricAuth` → quick reauth
   * Redirects to `/main`

2. **Auth Avatar** (`AuthToggle.tsx`)

   * If logged in: show **avatar** (if `image` provided) or **initials**
   * Popover menu: **View Profile** / **Logout**
   * Logout clears storage & routes to `/signin`

---

## 🌗 Theming

* `ThemeContext` exposes `isDarkMode`, `toggleTheme`, and a `color` palette:

  * `background`, `surface`, `text`, `textSecondary`, `primary`, etc.
* `ThemeToggle` renders a glossy gradient rail and animated knob with consistent shadows on iOS & Android.
* Design rule: **no white borders** for cards; use platform drop shadows to create depth.

---

## 🏠 Home (`app/main.tsx`)

* Header greeting + avatar (navigates to profile)
* **AnimatedCard** sections (info, quick actions, deep links)
* Grid tiles (Feed / Class / Setting) with soft shadow wrappers
* **BottomBar** overlays at screen bottom (safe-area aware)

---

## 👤 Profile (`app/profile/index.tsx`)

* Large avatar (or fallback), name/email, quick stats:

  * Student ID / Year / Major (3-column pill stats, clipped within card)
* School & Advisor sections (logo/photo if provided)
* **Edit Profile** modal with validation → `updateProfile` service

> **Tip**: We use a shared **shadow system** for parity across cards/chips/tiles.

---

## 🎓 Class Directory (`app/class/[year].tsx`)

* Dynamic route (e.g., `/class/2568`)
* Search **name/email/studentId** locally
* Each item shows avatar (or initials), name, email, badges for **ID/Major**
* Pull to refresh → refetch members for the selected year

---

## 📰 Feed (`app/feed/index.tsx`)

* Composer at top → create status (**optimistic**) then sync
* Post cards with author avatar/initials, content, actions:

  * **Like/Unlike** is optimistic with rollback on failure
  * **Delete** only for own post
* Friendly `timeAgo` (s/m/h/d/w/mo/y) and **no hard-coded locale**

### Post Detail (`app/feed/[id].tsx`)

* Header shows author + `timeAgo` and **Delete** on the right (no back button)
* Comments list with avatar/initials, own comment delete, composer at bottom
* Pull to refresh

---

## 🧪 Services

### `services/authService.ts`

* `login(email, password)` → `{ token }`
* `getProfile()` → user profile (also used by `AuthToggle` to determine avatar/initials)
* `updateProfile(payload)` → persists profile changes

### `services/classService.ts`

* `getMembersByYear(year)` → array of members { firstname, lastname, email, education, image }

### `services/statusService.ts`

* `listStatuses()` / `getStatusById(id)`
* `createStatus(content)`
* `likeStatus(id)` / `unlikeStatus(id)`
* `addComment(statusId, content)` / `deleteComment(commentId, statusId)`
* `deleteStatus(id)`
* Helpers: `displayName(createdBy)`, `didILike(post, myEmail)`, `isMine(createdBy, myEmail)`

> All fetchers include `Authorization: Bearer <token>` when present.

---

## 🖼️ Avatars & Initials

* When `user.image` is present → show as avatar
* Otherwise derive **initials** from `firstname/lastname` or `username/email`
* Fallback color: blue (`#4a90e2`) in light mode, dark gray in dark mode

---

## 🧩 UI/UX Guidelines

* **No white borders** on cards → rely on shadows (`elevation` on Android, `shadow*` on iOS)
* `overflow: hidden` only on **inner** containers so shadows remain soft (outer wrappers keep shadow)
* Chip/Badge: rounded (999), consistent padding, and subtle background based on theme
* Buttons: 10–12 radius, bold labels, proper disabled styles

---

## 🛠️ Development Tips

* Prefer **optimistic UI** for like/comment/create to keep the app snappy
* Use `useFocusEffect` to refresh screens on re-entry
* Share `timeAgo` helper across Feed & Detail to keep behavior consistent
* Use `measureInWindow` for popovers (e.g., `AuthToggle`) to anchor menus next to the avatar

---

## 🔒 Biometric Notes (`hooks/useBiometricAuth.ts`)

* Checks device capability + enrollment
* Triggers prompt after sign-in (configurable)
* If biometric fails, keep user on sign-in and show an Alert

---

## 🧪 Example: Sign In & Persist

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, getProfile } from "../services/authService";

async function handleSignin(email: string, password: string) {
  const { token } = await login(email, password);
  await AsyncStorage.setItem("authToken", token);
  const profile = await getProfile();
  await AsyncStorage.setItem("user", JSON.stringify(profile));
  // Optionally: biometric authenticate() here
}
```

---

## 🧪 Example: Time Ago Helper

```ts
export const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  let diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 0) diff = 0;
  if (diff < 5) return "now";
  const MIN = 60, HOUR = 3600, DAY = 86400, WEEK = 604800, MONTH = 2592000, YEAR = 31536000;
  if (diff < MIN) return `${diff}s`;
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo`;
  return `${Math.floor(diff / YEAR)}y`;
};
```

---

## 🧰 Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint ."
  }
}
```

---

## 🧪 Testing Checklist

* [ ] Sign-in success & failure paths
* [ ] Profile loads & edit modal updates data
* [ ] Feed create/like/unlike/comment/delete (optimistic & rollback)
* [ ] Detail screen delete on right (no back button), comments CRUD
* [ ] Class directory search + year param
* [ ] Theme toggle & shadows (light/dark)
* [ ] Avatar fallback → initials logic

---

## 🐞 Troubleshooting

* **Shadows look like square boxes in light mode**: ensure shadow is applied on the **wrapper** view and the child has `overflow: hidden` if needed for rounded corners.
* **Biometric not prompting**: confirm device enrollment & permissions; check `useBiometricAuth` logic.
* **Token missing after restart**: verify AsyncStorage writes and restore logic on app boot.
* **TimeAgo wrong**: make sure server returns ISO timestamps; see helper for parsing.

---

## 📜 License

Educational use for **Hybrid Mobile Application Programming** (IN405109),
Department of Computer Science, **Khon Kaen University**.

---

## 👤 Author

**Pathipat Mattra**
Facebook: *Pathipat Mattra*
GitHub: *pathipat11*
LinkedIn: *Pathipat Mattra*
