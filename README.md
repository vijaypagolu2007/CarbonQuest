# 🌍 CarbonQuest

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-brightgreen?style=flat-square&logo=google-cloud)](https://carbonquest-64990759915.us-central1.run.app/)
[![GitHub](https://img.shields.io/badge/GitHub-CarbonQuest-black?style=flat-square&logo=github)](https://github.com/vijaypagolu2007/CarbonQuest)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**Live Demo**: [https://carbonquest-64990759915.us-central1.run.app/](https://carbonquest-64990759915.us-central1.run.app/)

**Make Carbon Visible. Make Change Real.**

CarbonQuest is a gamified, mobile-first web application that transforms your real-world sustainable actions into a thriving, 3D interactive virtual world. Track your carbon footprint, defeat Weekly Carbon Monsters, and watch your floating eco-city grow!

---

## ✨ Features

- **🎮 3D Living World Dashboard**: A beautifully rendered, interactive 3D floating eco-city built with React Three Fiber. The health of your city directly reflects your real-world carbon footprint.
- **📱 Mobile-First Glassmorphism UI**: A premium, responsive interface featuring dynamic animated ambient lighting, frosted glass cards, and smooth micro-animations.
- **🤖 AI Eco-Coach**: Your personal "Eco Guardian" powered by Gemini, providing personalized advice and quests to help you lower your emissions.
- **🔐 Secure Authentication**: Integrated with Firebase Authentication for seamless login across desktop and mobile devices.
- **🐉 Weekly Carbon Bosses**: Team up to defeat weekly "Carbon Monsters" by logging sustainable actions to deal damage and earn rare eco-crystals for your world!
- **📊 Real-Time Insights**: Live carbon footprint breakdown by category (food, transport, energy, shopping, waste) using official emission factors.
- **🔥 Streaks & Badges**: Daily streak rewards and achievement badges for eco-milestones to keep you motivated.

---

## 🤖 How AI Powers CarbonQuest

CarbonQuest integrates **Google Gemini 2.5 Flash** as the core AI engine in two ways:

### 1. Eco Guardian Coach (`/dashboard/coach`)
The AI Coach maintains full awareness of the user's current game state:
- **World Health** (0–100) — reflects recent carbon behaviour
- **XP & Level** — gamification progress
- **Carbon Trend** — whether the user is improving or worsening
- **Last 10 Activities** — e.g. "drove 20 km" or "ate a vegan meal"

With this context, the Eco Guardian gives hyper-personalized, encouraging advice — not generic climate tips. For example, if a user logs a flight, it proactively suggests carbon offset strategies.

### 2. Personalized Quest Generation
Based on quiz answers, the AI dynamically generates a set of daily quests tailored to the user's highest-impact carbon categories (e.g., a frequent flyer gets flight offset quests; a meat-heavy eater gets plant-based meal challenges).

---

## 📐 Carbon Footprint Methodology

All emission factors are sourced from official, peer-reviewed bodies:

| Category | Source | Standard |
|---|---|---|
| Food | IPCC AR6 (2022), Oxford Martin School | kg CO₂e per meal type |
| Transport | UK DEFRA 2023, EPA eGRID 2022 | kg CO₂e per km |
| Energy | IEA World Energy Outlook 2023 | kg CO₂e per kWh |
| Shopping | WRAP (Waste & Resources Action Programme) | kg CO₂e per item category |
| Flights | ICAO Carbon Emissions Calculator | kg CO₂e per passenger-km |

The global average carbon footprint is **~4,600 kg CO₂e/year** (World Bank, 2022). CarbonQuest targets the internationally agreed safe limit of **<2,000 kg CO₂e/year** per person.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Standalone) |
| **Language** | TypeScript (strict mode) |
| **3D Rendering** | Three.js + React Three Fiber |
| **Styling** | Tailwind CSS v3 + Custom CSS (Glassmorphism) |
| **Animations** | Framer Motion |
| **Auth & DB** | Firebase Auth + Firestore |
| **AI** | Google Gemini 2.5 Flash via `@google/genai` |
| **Deployment** | Google Cloud Run (auto-scaling, serverless) |
| **Testing** | Vitest + Testing Library (47+ tests) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (free tier is sufficient)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vijaypagolu2007/CarbonQuest.git
   cd CarbonQuest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase and Gemini API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Testing
```bash
npm run test          # Run all unit tests
npm run test:watch    # Watch mode
```

### Production Build
```bash
npm run build
npm run start
```

---

## 📱 Mobile Testing

To test on a physical device connected via USB debugging:

1. Ensure your device and computer are on the same network
2. Add your local IP to `allowedDevOrigins` in `next.config.js`
3. Run `npm run dev -- -H 0.0.0.0`
4. Navigate to `http://<YOUR_LOCAL_IP>:3000` on your phone

---

## 🔒 Security

CarbonQuest implements industry-standard security practices:
- **HTTP Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting**: AI chat API is limited to 10 requests/minute per IP
- **Input Sanitization**: All user inputs are sanitized before processing
- **Environment Variables**: All secrets stored as env vars, never in code
- **Firebase Security Rules**: Firestore data is protected by user-scoped security rules

---

## 🤝 Contributing

Your feedback and contributions are welcome! Help us build a greener future, one line of code at a time. 🌱

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

*Built with ❤️ and ☀️ for the Google Gemini Hackathon 2026*
