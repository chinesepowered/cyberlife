# 🎮 Mystic Quest - AI-Powered Adventure Game

A revolutionary 2D adventure game that integrates AI (Llama 3.2 11B) to create dynamic, personalized gaming experiences. Perfect for hackathons with its innovative AI-driven gameplay mechanics!

## 🚀 Features

- **AI Oracle Integration**: Real-time AI-powered guidance and storytelling
- **Dynamic World**: Procedurally generated NPCs, items, and quests
- **Immersive Visuals**: Sleek gradients, animations, and particle effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Rate-Limited AI Calls**: Optimized for API limits (6 calls/minute)
- **Progressive Experience**: Level system with AI-influenced rewards

## 🛠 Technology Stack

- **Frontend**: Next.js 14 + React 18
- **Styling**: Tailwind CSS with custom animations
- **AI Integration**: Together AI (Llama 3.2 11B Vision Instruct Turbo)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ installed
- Together AI API key (free tier available)
- Basic knowledge of React/Next.js

## 🎯 Quick Setup

### 1. Initialize Project

```bash
# Create new Next.js project
npx create-next-app@14 mystic-quest-ai-game
cd mystic-quest-ai-game

# Install dependencies
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Environment

Create `.env.local` in your project root:

```env
TOGETHER_API_KEY=your_together_ai_api_key_here
```

### 3. File Structure

```
mystic-quest-ai-game/
├── components/
│   └── MysticQuestGame.js     # Main game component
├── pages/
│   ├── api/
│   │   └── ai-oracle.js       # AI API endpoint
│   └── index.js               # Home page
├── styles/
│   └── globals.css            # Global styles
├── tailwind.config.js         # Tailwind configuration
├── .env.local                 # Environment variables
└── package.json               # Dependencies
```

### 4. Copy Game Files

1. **Copy the main game component** from the first artifact to `components/MysticQuestGame.js`
2. **Copy the API endpoint** from the second artifact to `pages/api/ai-oracle.js`
3. **Copy the configurations** from the respective artifacts
4. **Update your styles** with the CSS from the globals.css artifact

### 5. Run the Game

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to play!

## 🎮 How to Play

### Controls
- **WASD** or **Arrow Keys**: Move your character
- **Space**: Interact with NPCs and collect items
- **Ctrl + Enter**: Consult the AI Oracle
- **Scene Buttons**: Travel between different locations

### Gameplay Flow
1. **Explore**: Move around different mystical scenes
2. **Interact**: Talk to NPCs and collect magical items
3. **Consult Oracle**: Ask the AI for guidance, puzzles, or story elements
4. **Level Up**: Gain experience through exploration and interactions
5. **Progress**: Complete AI-generated quests and challenges

## 🤖 AI Integration Details

### Oracle Capabilities
- **Dynamic Storytelling**: Creates personalized narrative content
- **Puzzle Generation**: Provides context-aware challenges
- **Game State Awareness**: Responds based on player progress
- **Atmospheric Responses**: Maintains mystical, engaging tone

### Rate Limiting Strategy
- **6 calls per minute** max to respect API limits
- **Intelligent caching** of responses
- **Fallback responses** when API is unavailable
- **Context-aware batching** to maximize effectiveness

### AI Prompt Engineering
The system uses sophisticated prompts that include:
- Current game state and context
- Player level and inventory
- Scene-specific information
- Quest progress tracking
- Mystical personality consistency

## 🎨 Customization Options

### Visual Themes
- Modify scene colors in the `scenes` object
- Adjust gradients and animations in Tailwind config
- Add new particle effects or visual elements

### Game Mechanics
- Add new item types and effects
- Create additional scenes and locations
- Implement combat or puzzle systems
- Expand the leveling system

### AI Personality
- Modify the Oracle's personality in the API endpoint
- Add different AI characters with unique voices
- Implement context-specific AI responses
- Create AI-driven dynamic events
