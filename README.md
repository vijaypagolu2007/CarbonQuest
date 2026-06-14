# 🌍 CarbonQuest

**Live Demo**: [https://carbonquest-299544098528.us-central1.run.app/](https://carbonquest-299544098528.us-central1.run.app/)

**Make Carbon Visible.** 

CarbonQuest is a gamified, mobile-first web application that transforms your real-world sustainable actions into a thriving, 3D interactive virtual world. Track your carbon footprint, defeat Weekly Carbon Monsters, and watch your floating eco-city grow!

## ✨ Features

- **🎮 3D Living World Dashboard**: A beautifully rendered, interactive 3D floating eco-city built with React Three Fiber. The health of your city directly reflects your real-world carbon footprint.
- **📱 Mobile-First Glassmorphism UI**: A premium, responsive interface featuring dynamic animated ambient lighting, frosted glass cards, and smooth micro-animations.
- **🤖 AI Eco-Coach**: Your personal "Eco Guardian" powered by Gemini, providing personalized advice and quests to help you lower your emissions.
- **🔐 Secure Authentication**: Integrated with Firebase Authentication for seamless login across desktop and mobile devices.
- **🐉 Weekly Carbon Bosses (Upcoming)**: Team up to defeat weekly "Carbon Monsters" by logging sustainable actions to deal damage and earn rare eco-crystals for your world!

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **3D Rendering**: Three.js & React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Styling**: Tailwind CSS & Custom CSS (Glassmorphism, Ambient Orbs)
- **Animations**: Framer Motion
- **Authentication & Backend**: Firebase (Auth, Firestore)

## 🚀 Getting Started

First, ensure you have your Firebase configuration set up in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ...
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app. 

### Testing on Mobile
To test the responsive UI and 3D performance on your mobile device, ensure your phone is on the same Wi-Fi network and navigate to:
`http://<YOUR_LOCAL_IP>:3000`

*(Note: Mobile access requires your local IP to be added to `allowedDevOrigins` in `next.config.js`).*

## 🤝 Contributing
Your feedback and contributions are welcome! Help us build a greener future, one line of code at a time. 🌱
