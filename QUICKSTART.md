# Quick Start Guide

Get up and running with AI Docstring Generator in 5 minutes!

## 🚀 Super Quick Setup (Local Development)

### 1. Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- A code editor (VS Code recommended)

### 2. Clone & Install

```bash
git clone https://github.com/BU-SENG/foss-project-light-pink.git
cd foss-project-light-pink
npm install
```

### 3. Environment Setup

**Option A: Use Without Backend (Limited Features)**

```bash
# Just start the dev server - no Supabase needed!
npm run dev
```

- File upload ✅
- Function detection ✅
- Code preview ✅
- Docstring generation ❌ (requires Supabase)
- History ❌ (requires Supabase)

**Option B: Full Setup with Supabase (5 minutes)**

1. **Get Supabase credentials** (free tier):

   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Copy Project URL and anon key

2. **Configure environment**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx...
   ```

3. **Set up database**:

   - Go to SQL Editor in Supabase
   - Run: `supabase/migrations/20240101000000_create_docgen_history.sql`

4. **Deploy Edge Function**:

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF

   # Set Gemini API key (get from https://makersuite.google.com/app/apikey)
   supabase secrets set GEMINI_API_KEY=your_key_here

   # Deploy
   supabase functions deploy generate-docstring
   ```

5. **Start dev server**:

   ```bash
   npm run dev
   ```

6. **Open browser**: http://localhost:5173

## 🎯 First Time Usage

### Test It Out

1. **Create a test file** (`test.py`):

```python
def add(a, b):
    return a + b

class Calculator:
    def multiply(self, x, y):
        return x * y
```

2. **Upload the file** in the app
3. **Click "Generate Docstrings"**
4. **Download** the documented code!

### Result:

```python
def add(a, b):
    """
    Adds two numbers together.

    Args:
        a: The first number
        b: The second number

    Returns:
        The sum of a and b
    """
    return a + b
```

## 📋 Common Issues & Solutions

### "Cannot find module errors"

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection error"

- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check browser console for specific errors

### "Edge function not found"

- Ensure edge function is deployed: `supabase functions list`
- Check function logs: `supabase functions logs generate-docstring`
- Verify GEMINI_API_KEY is set: `supabase secrets list`

### Port 5173 already in use

```bash
# Use a different port
npm run dev -- --port 3000
```

## 🎓 Next Steps

- Read the full [README.md](./README.md)
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed backend setup
- See [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute
- Try different docstring formats (Google, NumPy, Sphinx)
- Upload your own code files

## 💡 Pro Tips

1. **Offline Mode**: Works without login, uses localStorage
2. **Keyboard Shortcuts**: Use Monaco Editor shortcuts (Ctrl+F to search)
3. **Multiple Formats**: Try different docstring styles for your needs
4. **Batch Processing**: Upload files one by one (batch mode coming soon!)
5. **Dark Mode**: Automatically follows your system preference

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/BU-SENG/foss-project-light-pink/issues)
- **Documentation**: Check the `docs/` folder
- **Supabase**: [Supabase Docs](https://supabase.com/docs)
- **Gemini API**: [Google AI Docs](https://ai.google.dev/docs)

---

**Happy documenting! 🎉**
