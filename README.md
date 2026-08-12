# ReadyAlert 🚨

An Android mobile app that keeps you informed about weather warnings and national emergency alerts in Austria, and also helps you prepare before any disaster strikes.

Built with [Expo](https://expo.dev) and React Native.

---

## Features

- **Home Dashboard** — Detects your GPS location and fetches active weather warnings from the [Geosphere Austria](https://www.geosphere.at/) API, the current weather status and Air Quality Index from [OpenMeteo API](https://open-meteo.com/), and the Radiation level from the [Austrian-BMLUK](https://radiologischesereignis.gv.at/de/home/), displayed on an interactive map with expandable warning cards.
- **National Status** — Shows country-wide alerts from the [RTR Austria](https://www.rtr.at/) alerting system, colour-coded by severity, on a national map. Shows the daily weather state for each Austrian state (capital city) from the [OpenMeteo API](https://open-meteo.com/).
- **Emergency Page** — Quick-access emergency contacts and guidance for crisis situations.
- **Learning Centre** — Step-by-step preparedness guides and checklists, with progress tracking.
- **Push Notifications** — Alerts you when new warnings or alerts are detected, even in the background.
- **Dark / Light Theme** — Follows system preference automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS) |
| Maps | react-native-maps |
| Location | expo-location |
| Notifications | expo-notifications |
| Local Storage | expo-sqlite, AsyncStorage |
| APIs | Geosphere Austria, RTR Austria, OpenMeteo, Austrian-BMLUK |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A physical device or emulator (Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/lucreciaef/ReadyAlert.git
cd ReadyAlert

# Install dependencies
npm install
```

### Running the App

```bash
# Run on Android using an Expo Development Build
npx expo start --clean
# Disclaimer: Expo Go will not be able to show Google Maps and Notifications, so it is not recommended.

```

> **Note:** Location and notification permissions are required for full functionality. The app is designed for use within Austria.

---

## Project Structure

```
src/
├── api/          # API integrations
├── components/   # Reusable UI components
├── context/      # Location & Preparedness context providers
├── db/           # SQLite migrations
├── hooks/        # Custom hooks (location, notifications, checklists, etc.)
├── pages/        # App screens
│   └── learning/ # Learning Centre sub-pages
│   └── settings/ # Settings sub-pages
├── styles/       # Theme colours, map styles, shared styles
├── tasks/        # Background task managing helpers
├── theme/        # Dark/light theme context
└── utils/        # Coordinate conversion, notification helpers
```

---

## Permissions

The app requests the following permissions:

- **Location** — to fetch warnings relevant to your current position
- **Notifications** — to deliver real-time emergency alerts

---

## License

This project was developed as a university final project. All rights reserved.
