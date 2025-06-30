# LabXplorer 🧪

A comprehensive virtual laboratory platform for interactive science education, built with React, TypeScript, and modern web technologies.

## Features

### 🔬 Virtual Laboratory
- Interactive experiment simulations
- Real-time data visualization
- Safety protocols and guidelines
- Equipment and tool simulations

### 📚 Educational Games
- Gamified learning experiences
- Science-based challenges and puzzles
- Achievement system with badges
- Leaderboards and competitions

### 📝 Digital Lab Notebook
- Markdown-based note-taking
- Real-time collaboration
- Experiment documentation
- Screenshot capture and PDF export

### 🏆 Gamification
- Experience points (XP) system
- Level progression
- Achievement badges
- Global leaderboards

### 👥 Collaboration
- Real-time collaborative editing
- Shared experiments and notes
- Team challenges
- Peer review system

### 📱 Progressive Web App
- Offline functionality
- Push notifications
- Native app-like experience
- Cross-platform compatibility

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Database**: Supabase
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **PWA**: Vite PWA Plugin, Workbox
- **Animations**: Framer Motion
- **Documentation**: React Markdown
- **PDF Generation**: jsPDF
- **Screenshots**: html2canvas

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/labxplorer.git
cd labxplorer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Supabase:
   - Create a new Supabase project
   - Add your Supabase URL and anon key to `.env.local`
   - Run the database migrations (see Database Setup)

5. Start the development server:
```bash
npm run dev
```

### Database Setup

The application uses Supabase for data storage. You'll need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the database schema (migrations coming soon)
3. Configure Row Level Security (RLS) policies
4. Add your Supabase credentials to environment variables

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── experiments/    # Experiment-specific components
│   ├── games/          # Game components
│   ├── assessment/     # Assessment components
│   ├── collaboration/ # Collaboration features
│   └── dashboard/      # Dashboard components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## PWA Features

The application is configured as a Progressive Web App with:

- Service Worker for offline functionality
- App manifest for installation
- Caching strategies for optimal performance
- Background sync for data synchronization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Bolt.new](https://bolt.new) for rapid prototyping
- Uses [Pexels](https://pexels.com) for stock imagery
- Powered by [Supabase](https://supabase.com) for backend services
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Built with ❤️ for science education**