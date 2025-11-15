# 🤖 AI Docstring Generator

> Automatically generate professional docstrings for Python and JavaScript code using Gemini 2.0 Pro AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E)](https://supabase.com/)

A modern web application that uses AI to automatically generate high-quality docstrings for your code. Upload Python or JavaScript files, and let Gemini 2.0 Pro create professional documentation in various formats (Google, NumPy, Sphinx, JSDoc).

## ✨ Features

### Core Functionality
- 📁 **File Upload**: Drag & drop or browse for `.py`, `.js`, or `.ts` files
- 🔍 **Smart Parsing**: Automatically detects functions, classes, and methods
- 🤖 **AI-Powered**: Uses Gemini 2.0 Pro for intelligent docstring generation
- 📝 **Multiple Formats**: Support for Google, NumPy, Sphinx, and JSDoc styles
- 👀 **Live Preview**: See generated docstrings with Monaco Editor
- ⬇️ **Export**: Download your documented code instantly

### User Features
- 🔐 **Authentication**: Email login with optional GitHub/Google OAuth
- 📜 **History**: Track and manage previous generations
- 💾 **Offline Mode**: Works without login using localStorage
- 🎨 **Modern UI**: Clean, responsive design with TailwindCSS
- 🌙 **Dark Mode**: Support for light and dark themes

### Technical Features
- ⚡ **Fast**: Built with Vite for lightning-fast development
- 🔒 **Secure**: Row-level security with Supabase
- 🚀 **Serverless**: Edge functions for scalable AI processing
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ♿ **Accessible**: Built with accessibility in mind

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- A Gemini API key ([get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BU-SENG/foss-project-light-pink.git
   cd foss-project-light-pink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase** (see detailed guide below)
   - Create a new Supabase project
   - Run database migrations
   - Deploy Edge Functions
   - Configure authentication

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP.md)** - Complete Supabase configuration
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for blazing-fast development and builds
- **TailwindCSS** for utility-first styling
- **React Router** for client-side routing
- **Monaco Editor** for code editing with syntax highlighting
- **Lucide Icons** for beautiful, consistent icons

### Backend Stack
- **Supabase** for:
  - PostgreSQL database
  - Authentication (email, GitHub, Google)
  - Row-Level Security (RLS)
  - Edge Functions (serverless)

### AI Integration
- **Gemini 2.0 Pro** via Google's Generative AI API
- Deployed as Supabase Edge Function (Deno runtime)
- Secure API key storage in Supabase secrets

### Project Structure

```
foss-project-light-pink/
├── src/
│   ├── components/          # React components
│   │   ├── AuthModal.tsx    # Authentication modal
│   │   ├── CodeEditor.tsx   # Monaco editor wrapper
│   │   ├── FileUpload.tsx   # Drag & drop upload
│   │   ├── FunctionList.tsx # Detected functions display
│   │   └── Layout.tsx       # Main layout with nav
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/
│   │   ├── Home.tsx         # Main generation page
│   │   └── History.tsx      # History page
│   ├── services/
│   │   └── api.ts          # API service functions
│   ├── utils/
│   │   └── codeParser.ts   # Code parsing utilities
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/
│   │   └── generate-docstring/  # Edge function
│   │       └── index.ts
│   └── migrations/
│       └── 20240101000000_create_docgen_history.sql
└── ...config files
```

## 🎯 Usage

### Basic Workflow

1. **Upload a file**: Click or drag & drop a Python or JavaScript file
2. **Review detected functions**: See all functions/classes found in your code
3. **Choose format**: Select docstring style (Google, NumPy, Sphinx, JSDoc)
4. **Generate**: Click "Generate Docstrings" to create documentation
5. **Preview**: Review the generated docstrings in the editor
6. **Download**: Export your documented code

### Example

**Input (Python):**
```python
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count
```

**Output (Google Style):**
```python
def calculate_average(numbers):
    """
    Calculates the average of a list of numbers.
    
    Args:
        numbers: A list of numerical values.
    
    Returns:
        The average of the numbers in the list.
    
    Raises:
        ZeroDivisionError: If the input list is empty.
    """
    total = sum(numbers)
    count = len(numbers)
    return total / count
```

## 🔧 Configuration

### Docstring Formats

- **Google Style**: Clean, readable format used by Google
- **NumPy Style**: Detailed format popular in scientific Python
- **Sphinx Style**: ReStructuredText format for Sphinx docs
- **JSDoc**: Standard JavaScript documentation format

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

### Supabase Secrets

| Secret | Description | Where to Set |
|--------|-------------|--------------|
| `GEMINI_API_KEY` | Your Gemini API key | Supabase CLI or Dashboard |

## 🚢 Deployment

### Frontend Deployment

Deploy to any static hosting service:

**Vercel** (Recommended):
```bash
npm run build
vercel deploy
```

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Backend (Supabase)

Your Supabase project is already deployed! Just ensure:
1. Edge Functions are deployed
2. Database migrations are applied
3. Environment secrets are set

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for details.

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for the powerful AI API
- **Supabase** for the excellent backend platform
- **Vite** for the amazing build tool
- **Monaco Editor** for VS Code-quality editing in the browser
- **TailwindCSS** for the utility-first CSS framework

## 🗺️ Roadmap

- [ ] Support for more languages (TypeScript, Java, Go, Rust)
- [ ] Batch processing for multiple files
- [ ] VS Code extension
- [ ] CLI tool for CI/CD integration
- [ ] Custom docstring templates
- [ ] Real-time collaboration

---

**Made with ❤️ for Open Source**
