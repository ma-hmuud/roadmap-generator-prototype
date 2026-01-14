# Roadmap Generator

AI-powered learning roadmap generator that creates personalized step-by-step learning paths for any topic.

## Features

- **AI-Generated Roadmaps** - Enter any topic and get a customized learning path
- **Personalized Questions** - AI asks clarifying questions to tailor the roadmap to your experience level and goals
- **Interactive Graph Editor** - View and edit your roadmap as a draggable node graph using React Flow
- **Progress Tracking** - Mark steps as completed and track your learning journey
- **Resource Management** - Each step includes curated learning resources with links

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Convex](https://convex.dev/) (database & server functions)
- **Authentication**: [Convex Auth](https://labs.convex.dev/auth)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) + [Google Gemini](https://ai.google.dev/)
- **Graph Visualization**: [React Flow](https://reactflow.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A Convex account
- A Google AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd roadmap-generator-prototype
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env.local file
   CONVEX_DEPLOYMENT=<your-convex-deployment>
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   GOOGLE_GENERATIVE_AI_API_KEY=<your-google-ai-api-key>
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

   This runs both the Next.js frontend and Convex backend concurrently.

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── signin/            # Authentication page
│   ├── dashboard/         # User's roadmaps dashboard
│   └── roadmap/           # Roadmap pages
│       ├── new/           # Create new roadmap
│       └── [id]/          # View/edit roadmap
├── components/
│   ├── roadmap/           # Roadmap-specific components
│   │   ├── RoadmapCreator.tsx
│   │   ├── RoadmapEditor.tsx
│   │   ├── RoadmapNode.tsx
│   │   └── ...
│   └── ui/                # shadcn/ui components
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── roadmaps.ts        # Roadmap mutations/queries
│   └── auth.ts            # Auth configuration
├── lib/                   # Utilities
│   ├── layout.ts          # Dagre graph layout
│   └── schemas.ts         # Zod schemas for AI
└── public/                # Static assets
```

## How It Works

1. **Topic Input** - User enters a topic they want to learn
2. **AI Questions** - Gemini generates personalized questions about experience level, goals, and preferences
3. **Roadmap Generation** - Based on answers, AI creates a structured learning roadmap with nodes and edges
4. **Interactive Editing** - Users can drag nodes, edit details, add resources, and mark steps complete
5. **Progress Tracking** - All changes are saved to Convex and synced in real-time

## License

MIT
