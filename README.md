# Content Vault Web ![Next.js](https://img.shields.io/badge/Next.js-15.1.11-blue) ![React](https://img.shields.io/badge/React-19.0.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue) ![Supabase](https://img.shields.io/badge/Supabase-2.39.7-blue)

---

## 📖 Introduction

**Content Vault Web** is a modern, responsive frontend application designed to provide users with a seamless interface for managing and interacting with their saved web content. Built with Next.js 15 and React 19, this application serves as the user-facing layer for a comprehensive knowledge management platform. It allows users to save, organize, search, and interact with various types of content (articles, videos, images) through an intuitive dashboard and intelligent chatbot.

This frontend application works in conjunction with a backend API (Pinnacle---Backend) to provide features like content extraction, transcription, OCR, and retrieval-augmented generation (RAG) for context-aware conversations.

---

## ✨ Features

- **User Authentication:** Secure login and signup using Supabase Auth
- **Content Management Dashboard:** View and manage saved content in a grid layout
- **Intelligent Chatbot:** AI-powered chat with RAG capabilities to answer questions about saved content
- **Folder & Tag Management:** Organize content with customizable folders and tags
- **Advanced Search & Filtering:** Search and filter content by media type, folders, tags, and keywords
- **Dark/Light Theme:** Toggle between dark and light modes for comfortable viewing
- **Shareable Content:** Generate shareable links for saved items
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Real-time Updates:** Live updates to content and user interactions
- **API Key Management:** Configure and manage API keys for LLM providers

---

## 🛠️ Tech Stack

| Technology / Library             | Purpose                                                      | Version / Details                                    |
|----------------------------------|--------------------------------------------------------------|-----------------------------------------------------|
| **Next.js**                     | React framework for production                              | 15.1.11                                             |
| **React**                       | UI library                                                   | 19.0.0                                              |
| **TypeScript**                  | Type-safe development                                       | 5.3.3                                               |
| **Tailwind CSS**                | Utility-first CSS framework                                 | 3.4.1                                               |
| **Supabase Auth UI**            | Authentication components                                    | 0.4.7                                               |
| **Supabase JavaScript SDK**     | Database and auth integration                                | 2.39.7                                              |
| **Radix UI**                    | Accessible UI primitives                                    | Various versions (see package.json)                 |
| **Lucide React**                | Icon library                                                 | 0.344.0                                             |
| **Zustand**                     | State management                                             | 4.5.0                                               |
| **React Markdown**              | Markdown rendering                                           | 9.0.1                                               |
| **React Syntax Highlighter**    | Code syntax highlighting                                     | 15.5.0                                              |
| **Next Themes**                 | Theme management for dark/light modes                        | 0.4.6                                               |

---

## 🚀 Quick Start / Installation

```bash
# Clone the repository
git clone [repository-url]
cd content-vault-web

# Install dependencies (using pnpm)
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env as needed with your API endpoints and config

# Run the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 📁 Project Structure

```
src/
│
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page (auth redirect)
│   ├── globals.css            # Global styles
│   ├── api/                   # API routes
│   │   └── sync/              # Sync API endpoint
│   ├── auth/                  # Authentication pages
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── dashboard/             # Main dashboard
│   │   ├── page.tsx           # Dashboard home
│   │   ├── folders/           # Folder management
│   │   ├── save/              # Save new content
│   │   └── tags/              # Tag management
│   ├── settings/              # Settings page
│   └── share/                 # Shareable content pages
│
├── components/                 # React components
│   ├── ui/                    # Radix UI components
│   ├── ApiKeySettings.tsx     # API key management
│   ├── Autocomplete.tsx       # Autocomplete input
│   ├── BulkActions.tsx        # Bulk content actions
│   ├── ChatBot.tsx            # AI chatbot
│   ├── DarkModeToggle.tsx     # Theme toggle
│   ├── ExportDialog.tsx       # Export functionality
│   ├── FilterBar.tsx          # Content filters
│   ├── ItemGrid.tsx           # Content grid display
│   ├── ShareDialog.tsx        # Share content dialog
│   └── ThemeProvider.tsx      # Theme context
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts             # Authentication hook
│   ├── useChat.ts             # Chat functionality hook
│   └── useItems.ts            # Items management hook
│
├── lib/                        # Utility functions
│   ├── api.ts                 # API integration
│   ├── supabase.ts            # Supabase client
│   └── utils.ts               # General utilities
│
└── ...
```

---

## 🔧 Configuration

- **Environment Variables (.env):**
  - `NEXT_PUBLIC_API_URL`: Backend API endpoint (e.g., `http://localhost:8000`)
  - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous public API key

---

## 🎯 Key Pages & Components

### Dashboard
The main hub for users to manage their saved content. Features include:
- Search bar for quick content lookup
- Tabs to switch between items grid and chatbot
- Filter bar for advanced content filtering
- Item grid with bulk actions support
- Chatbot with RAG capabilities

### Folder Management
Organize content into customizable folders:
- Create, edit, and delete folders
- View items in specific folders
- Drag-and-drop functionality

### Tag Management
Manage content tags:
- Create and delete tags
- View items with specific tags
- Tag cloud visualization

### Content Saving
Save new content to the vault:
- URL input for web pages, videos, or images
- Add notes and tags during saving
- Select destination folder

### Shareable Content
Generate shareable links for saved items:
- Public access to shared content
- View-only mode for shared items

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to the open-source community for Next.js, React, and Tailwind CSS.
- Special thanks to contributors and testers helping improve platform features.
- Inspired by modern content management and AI-driven knowledge platforms.

---

*This README provides a detailed, accurate overview of Content Vault Web based solely on the codebase and project structure. For further details, refer to the source code and API documentation.*