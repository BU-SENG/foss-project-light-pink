# 🚀 Team Development Guide: 10-Stage Build Plan

## 📋 Project Overview

**AI Docstring Generator** - A React + TypeScript web app that uses Gemini 2.0 Pro AI to automatically generate professional docstrings for Python and JavaScript code files.

**Tech Stack**: React 18, TypeScript, Vite, TailwindCSS, Supabase (PostgreSQL + Auth + Edge Functions), Monaco Editor, Gemini AI

---

## 🎯 10-Stage Development Plan

Each stage is designed for one team member to complete independently. Stages 1-9 build the frontend, Stage 10 sets up the backend.

---

## STAGE 1: Project Foundation & Configuration

**Assigned To:** Team Member 1  
**Estimated Time:** 2-3 hours  
**Dependencies:** None (Start here!)

### 📝 Task Description
Set up the initial project structure, install dependencies, and configure the development environment with Vite, TypeScript, and TailwindCSS.

### 🎯 What to Build

1. **Initialize Vite + React + TypeScript project**
   ```bash
   npm create vite@latest ai-docstring-generator -- --template react-ts
   cd ai-docstring-generator
   npm install
   ```

2. **Install core dependencies**
   ```bash
   npm install react-router-dom @supabase/supabase-js
   npm install lucide-react
   ```

3. **Install TailwindCSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind** (`tailwind.config.js`):
   ```javascript
   export default {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#ffffff',
             100: '#f5f5f5',
             200: '#e5e5e5',
             300: '#d4d4d4',
             400: '#a3a3a3',
             500: '#737373',
             600: '#525252',
             700: '#404040',
             800: '#262626',
             900: '#171717',
           },
         },
       },
     },
   }
   ```

5. **Create TypeScript config** (`tsconfig.json`):
   - Add path aliases for imports: `"@/*": ["./src/*"]`
   - Enable strict type checking

6. **Set up project structure**:
   ```
   src/
   ├── components/
   ├── pages/
   ├── contexts/
   ├── services/
   ├── utils/
   ├── types/
   └── lib/
   ```

7. **Add Tailwind to CSS** (`src/index.css`):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   body {
     @apply bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900;
     @apply min-h-screen text-white;
   }
   ```

8. **Create environment template** (`.env.example`):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### ✅ Success Criteria
- `npm run dev` starts development server
- TailwindCSS classes work in components
- Project structure folders exist
- TypeScript compiles without errors

### 📚 Prompt for AI Assistant
```
I need to set up a Vite + React + TypeScript project with TailwindCSS for an AI docstring generator. 
Configure the project with:
1. Vite build tool
2. TypeScript with strict mode and path aliases (@/*)
3. TailwindCSS with custom primary color palette (grayscale)
4. Project folder structure (components, pages, contexts, services, utils, types, lib)
5. React Router for navigation
6. Environment variable template for Supabase
Please create all configuration files and set up the initial structure.
```

---

## STAGE 2: TypeScript Types & Data Models

**Assigned To:** Team Member 2  
**Estimated Time:** 1-2 hours  
**Dependencies:** Stage 1 complete

### 📝 Task Description
Define all TypeScript interfaces and types for the entire application. This creates the "contract" that all other components will use.

### 🎯 What to Build

Create `src/types/index.ts` with:

1. **Function Metadata Type**
   ```typescript
   export interface FunctionMetadata {
     name: string
     params: string[]
     body: string
     startLine: number
     endLine: number
     type: 'function' | 'class' | 'method'
     docstring?: string // Existing docstring if found
   }
   ```

2. **Docstring Format Type**
   ```typescript
   export type DocstringFormat = 'google' | 'numpy' | 'sphinx' | 'jsdoc'
   ```

3. **Generation Request Type**
   ```typescript
   export interface GenerationRequest {
     code: string
     language: 'python' | 'javascript'
     format: DocstringFormat
     functions: FunctionMetadata[]
   }
   ```

4. **Generation Response Type**
   ```typescript
   export interface GenerationResponse {
     docstrings: Array<{
       name: string
       docstring: string
     }>
     code: string // Code with docstrings inserted
   }
   ```

5. **History Entry Type**
   ```typescript
   export interface HistoryEntry {
     id: string
     created_at: string
     user_id?: string
     filename: string
     language: 'python' | 'javascript'
     format: DocstringFormat
     original_code: string
     generated_code: string
     function_count: number
   }
   ```

6. **User Type**
   ```typescript
   export interface User {
     id: string
     email: string
     created_at: string
   }
   ```

7. **Auth Context Type**
   ```typescript
   export interface AuthContextType {
     user: User | null
     loading: boolean
     signIn: (email: string, password: string) => Promise<void>
     signUp: (email: string, password: string) => Promise<void>
     signOut: () => Promise<void>
   }
   ```

### ✅ Success Criteria
- All types exported from `src/types/index.ts`
- No TypeScript errors
- Types documented with JSDoc comments
- Types cover all data structures needed

### 📚 Prompt for AI Assistant
```
I need to create comprehensive TypeScript types for an AI docstring generator application. Define interfaces for:
1. FunctionMetadata (represents parsed functions from code)
2. DocstringFormat (google, numpy, sphinx, jsdoc)
3. GenerationRequest (input to AI API)
4. GenerationResponse (output from AI API)
5. HistoryEntry (database record for saved generations)
6. User (authentication user data)
7. AuthContextType (React context for auth state)
Create a single file at src/types/index.ts with all types exported. Add JSDoc comments for documentation.
```

---

## STAGE 3: Code Parser Utilities

**Assigned To:** Team Member 3  
**Estimated Time:** 4-5 hours  
**Dependencies:** Stage 2 complete

### 📝 Task Description
Build utility functions to parse Python and JavaScript code files to extract functions, classes, and methods with their metadata.

### 🎯 What to Build

Create `src/utils/codeParser.ts` with three main functions:

1. **`parsePythonCode(code: string): FunctionMetadata[]`**
   - Use regex to find: `def function_name(params):` and `class ClassName:`
   - Extract function/class name, parameters, body, line numbers
   - Detect existing docstrings (triple quotes)
   - Handle async functions, methods in classes, decorators
   - Return array of FunctionMetadata

2. **`parseJavaScriptCode(code: string): FunctionMetadata[]`**
   - Use regex to find:
     - Function declarations: `function name() {}`
     - Arrow functions: `const name = () => {}`
     - Class methods: `methodName() {}`
   - Extract parameters, body, line numbers
   - Detect existing JSDoc comments (`/** */`)
   - Handle async functions and ES6+ syntax

3. **`insertDocstrings(code, language, docstrings): string`**
   - Take original code and array of generated docstrings
   - Insert docstrings at correct positions
   - For Python: Add triple-quoted strings after function definition
   - For JavaScript: Add JSDoc comments before function
   - Replace existing docstrings if present
   - Maintain proper indentation

### 💡 Key Challenges
- Accurately tracking line numbers
- Handling nested functions/classes
- Preserving code indentation
- Dealing with edge cases (comments, strings with keywords)

### ✅ Success Criteria
- `parsePythonCode` extracts all functions and classes
- `parseJavaScriptCode` handles function/arrow/class syntax
- `insertDocstrings` correctly positions documentation
- Test with sample Python and JavaScript files

### 📚 Prompt for AI Assistant
```
I need to create code parsing utilities for an AI docstring generator. Build three functions in src/utils/codeParser.ts:

1. parsePythonCode(code: string): FunctionMetadata[]
   - Parse Python code to extract functions and classes
   - Use regex to find 'def' and 'class' definitions
   - Extract name, parameters, body, line numbers
   - Detect existing docstrings (triple quotes)

2. parseJavaScriptCode(code: string): FunctionMetadata[]
   - Parse JavaScript/TypeScript code
   - Find function declarations, arrow functions, class methods
   - Extract name, parameters, body, line numbers
   - Detect existing JSDoc comments

3. insertDocstrings(code, language, docstrings): string
   - Insert generated docstrings into original code
   - Python: Add """docstring""" after function definition
   - JavaScript: Add /** docstring */ before function
   - Replace existing documentation if present
   - Maintain proper indentation

Use the FunctionMetadata type from src/types/index.ts. Handle edge cases and nested structures.
```

---

## STAGE 4: Supabase Client & API Service

**Assigned To:** Team Member 4  
**Estimated Time:** 2-3 hours  
**Dependencies:** Stage 2 complete

### 📝 Task Description
Set up Supabase client and create API service functions for authentication and docstring generation.

### 🎯 What to Build

1. **Create Supabase Client** (`src/lib/supabase.ts`):
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   
   if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error('Missing Supabase environment variables')
   }
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

2. **Create API Service** (`src/services/api.ts`):

   **Auth Functions:**
   ```typescript
   export async function signUp(email: string, password: string)
   export async function signIn(email: string, password: string)
   export async function signOut()
   export async function getCurrentUser()
   ```

   **Generation Functions:**
   ```typescript
   export async function generateDocstrings(request: GenerationRequest): Promise<GenerationResponse>
   // Calls Supabase Edge Function 'generate-docstring'
   
   export async function saveToHistory(entry: Omit<HistoryEntry, 'id' | 'created_at'>)
   export async function getHistory(userId?: string): Promise<HistoryEntry[]>
   export async function deleteHistoryEntry(id: string)
   ```

3. **Handle offline mode:**
   - If user not logged in, use localStorage for history
   - Provide fallback for all API calls

### 💡 Key Points
- All functions should handle errors gracefully
- Add TypeScript types for all parameters and returns
- Include try-catch blocks with meaningful error messages
- Check environment variables exist

### ✅ Success Criteria
- Supabase client initializes without errors
- API functions have proper TypeScript types
- Error handling in place for all async operations
- Can test auth functions (even without backend ready)

### 📚 Prompt for AI Assistant
```
I need to create Supabase integration for an AI docstring generator. Build:

1. src/lib/supabase.ts - Initialize Supabase client with environment variables

2. src/services/api.ts - Create API service with functions:
   - Auth: signUp, signIn, signOut, getCurrentUser
   - Generation: generateDocstrings (calls edge function 'generate-docstring')
   - History: saveToHistory, getHistory, deleteHistoryEntry
   
3. Add offline mode support using localStorage when user not logged in

Use types from src/types/index.ts. Include comprehensive error handling and TypeScript types for all functions.
```

---

## STAGE 5: Authentication Context & Modal

**Assigned To:** Team Member 5  
**Estimated Time:** 3-4 hours  
**Dependencies:** Stage 2, Stage 4 complete

### 📝 Task Description
Create React Context for authentication state and build a modal component for login/signup.

### 🎯 What to Build

1. **Auth Context** (`src/contexts/AuthContext.tsx`):
   ```typescript
   export const AuthProvider: React.FC<{ children: ReactNode }>
   export const useAuth = () => useContext(AuthContext)
   ```
   - Manage user state (logged in/out)
   - Provide auth functions (signIn, signUp, signOut)
   - Listen to Supabase auth state changes
   - Store user in state when authenticated

2. **Auth Modal** (`src/components/AuthModal.tsx`):
   - Modal dialog with tabs: "Login" | "Sign Up"
   - Email and password input fields
   - Submit buttons for each mode
   - Error message display
   - Loading state during authentication
   - Close button
   - Styled with Tailwind (glassmorphism design)

### 🎨 UI Design
```
┌─────────────────────────────┐
│  ✕                          │
│                             │
│  [Login] [Sign Up]          │
│                             │
│  Email:    [_____________]  │
│  Password: [_____________]  │
│                             │
│  [Login Button]             │
│                             │
│  ⚠ Error message here       │
└─────────────────────────────┘
```

### 💡 Features
- Tab switching between login/signup
- Form validation (email format, password length)
- Show loading spinner during auth
- Display error messages from API
- Close modal on successful auth
- Use lucide-react icons

### ✅ Success Criteria
- AuthContext provides user state to entire app
- Modal opens/closes correctly
- Login and signup forms work
- Errors displayed to user
- Modal styled with glassmorphism

### 📚 Prompt for AI Assistant
```
I need authentication for an AI docstring generator. Create:

1. src/contexts/AuthContext.tsx
   - React Context Provider for authentication state
   - Manage user state and loading state
   - Provide signIn, signUp, signOut functions
   - Listen to Supabase auth state changes
   - Export useAuth hook

2. src/components/AuthModal.tsx
   - Modal dialog with tabs (Login/Sign Up)
   - Email and password input fields
   - Submit handlers that use AuthContext
   - Error and loading state display
   - Close button and backdrop click to close
   - Glassmorphism styling with Tailwind (backdrop-blur, bg-white/10)
   - Use lucide-react icons (Mail, Lock, X)

Use api service from src/services/api.ts and types from src/types/index.ts.
```

---

## STAGE 6: File Upload & Function List Components

**Assigned To:** Team Member 6  
**Estimated Time:** 3-4 hours  
**Dependencies:** Stage 2, Stage 3 complete

### 📝 Task Description
Build the file upload component with drag-and-drop functionality and a component to display detected functions.

### 🎯 What to Build

1. **File Upload Component** (`src/components/FileUpload.tsx`):

   **Features:**
   - Drag and drop zone for files
   - Click to browse file picker
   - Accept only `.py`, `.js`, `.ts` files
   - Visual feedback for drag over
   - Display selected filename
   - Show file size and language icon
   - Clear/remove file button

   **Props:**
   ```typescript
   interface FileUploadProps {
     onFileSelect: (content: string, filename: string, language: 'python' | 'javascript') => void
     currentFile?: string
   }
   ```

2. **Function List Component** (`src/components/FunctionList.tsx`):

   **Features:**
   - Display list of detected functions
   - Show function name, type (function/class), parameter count
   - Show checkmark if docstring generated
   - Collapsible function body preview
   - Empty state when no functions found

   **Props:**
   ```typescript
   interface FunctionListProps {
     functions: FunctionMetadata[]
     generatedDocstrings?: string[]
   }
   ```

### 🎨 UI Design

**FileUpload:**
```
┌─────────────────────────────────┐
│  📁 Drag & drop your file here  │
│     or click to browse          │
│                                 │
│  ✓ main.py (2.5 KB) 🐍         │
│     [✕ Remove]                  │
└─────────────────────────────────┘
```

**FunctionList:**
```
┌─────────────────────────────────┐
│  Functions Detected: 3          │
├─────────────────────────────────┤
│  ✓ calculate_average()          │
│     Function · 1 param          │
├─────────────────────────────────┤
│  ⭕ process_data()              │
│     Function · 2 params         │
└─────────────────────────────────┘
```

### 💡 Key Features
- Use FileReader API to read file content
- Detect language from file extension
- Validate file size (max 5MB)
- Show loading state while reading
- Glassmorphism card styling

### ✅ Success Criteria
- Can drag and drop files
- Only accepts Python/JavaScript files
- Reads file content and passes to parent
- Function list displays parsed functions
- Shows function metadata clearly

### 📚 Prompt for AI Assistant
```
I need file upload and function display components for an AI docstring generator. Create:

1. src/components/FileUpload.tsx
   - Drag and drop zone for .py, .js, .ts files
   - Click to browse fallback
   - FileReader to read file content
   - Detect language from extension
   - Visual feedback for drag over state
   - Display selected filename with icon and size
   - Remove file button
   - Glassmorphism card styling with Tailwind

2. src/components/FunctionList.tsx
   - Display array of FunctionMetadata
   - Show function name, type, parameter count
   - Checkmark icon if docstring generated
   - Collapsible function body preview
   - Empty state message
   - Card styling with borders

Use lucide-react icons (Upload, FileCode, Function, Check). Use types from src/types/index.ts.
```

---

## STAGE 7: Code Editor Component

**Assigned To:** Team Member 7  
**Estimated Time:** 2-3 hours  
**Dependencies:** Stage 1 complete

### 📝 Task Description
Integrate Monaco Editor (VS Code's editor) to display and edit code with syntax highlighting.

### 🎯 What to Build

1. **Install Monaco Editor**:
   ```bash
   npm install @monaco-editor/react
   ```

2. **Create CodeEditor Component** (`src/components/CodeEditor.tsx`):

   **Props:**
   ```typescript
   interface CodeEditorProps {
     value: string
     onChange?: (value: string | undefined) => void
     language: 'python' | 'javascript' | 'typescript'
     readOnly?: boolean
     height?: string
   }
   ```

   **Features:**
   - Monaco Editor wrapper component
   - Dark theme (vs-dark)
   - Syntax highlighting for Python/JavaScript
   - Line numbers
   - Minimap disabled (cleaner UI)
   - Auto-formatting
   - Configurable height
   - Read-only mode for preview

   **Configuration:**
   ```typescript
   options={{
     readOnly,
     minimap: { enabled: false },
     fontSize: 14,
     lineNumbers: 'on',
     scrollBeyondLastLine: false,
     automaticLayout: true,
     tabSize: language === 'python' ? 4 : 2,
   }}
   ```

3. **Styling:**
   - Wrap in border with rounded corners
   - Backdrop blur background
   - Dark theme to match app design

### 💡 Key Points
- Monaco Editor is large (~5MB), loads async
- Show loading state while editor initializes
- Handle value changes properly
- Set correct tab size per language

### ✅ Success Criteria
- Editor displays with syntax highlighting
- Can type and edit code (when not read-only)
- Language detection works (python/javascript)
- Dark theme matches app design
- No performance issues

### 📚 Prompt for AI Assistant
```
I need a code editor component using Monaco Editor for an AI docstring generator. Create:

src/components/CodeEditor.tsx
- Wrap @monaco-editor/react Editor component
- Props: value, onChange, language, readOnly, height
- Support Python and JavaScript syntax highlighting
- Use vs-dark theme
- Configuration: disable minimap, enable line numbers, auto layout
- Set tab size (4 for Python, 2 for JavaScript)
- Wrap in styled container with border and backdrop-blur
- Show loading state while Monaco initializes

Use TypeScript with proper typing. Style with Tailwind CSS.
```

---

## STAGE 8: Layout & Navigation

**Assigned To:** Team Member 8  
**Estimated Time:** 2-3 hours  
**Dependencies:** Stage 5 complete

### 📝 Task Description
Create the main layout component with navigation bar and routing setup.

### 🎯 What to Build

1. **Layout Component** (`src/components/Layout.tsx`):

   **Structure:**
   ```
   ┌─────────────────────────────────────┐
   │  🤖 AI Docstring  [Home] [History]  │
   │      Generator         [Login/👤]   │
   ├─────────────────────────────────────┤
   │                                     │
   │  <Outlet /> (Page content here)    │
   │                                     │
   └─────────────────────────────────────┘
   ```

   **Features:**
   - Navigation bar at top
   - Logo/title on left
   - Navigation links (Home, History)
   - Auth button on right (Login if logged out, User menu if logged in)
   - User dropdown menu: Profile, Sign Out
   - Active link highlighting
   - React Router Outlet for page content
   - Responsive design (mobile menu)

2. **Update App.tsx** for routing:
   ```typescript
   <AuthProvider>
     <Routes>
       <Route path="/" element={<Layout />}>
         <Route index element={<Home />} />
         <Route path="history" element={<History />} />
       </Route>
     </Routes>
   </AuthProvider>
   ```

3. **Styling:**
   - Glassmorphism navbar
   - Sticky top position
   - Backdrop blur
   - Smooth transitions
   - Use lucide-react icons

### 🎨 Navigation Items
- Home (🏠) - Main generation page
- History (📜) - View past generations
- Login button (when logged out)
- User avatar + dropdown (when logged in)

### ✅ Success Criteria
- Navigation bar renders on all pages
- Links navigate correctly
- Active link highlighted
- Auth button shows correct state
- User dropdown works when logged in
- Responsive on mobile

### 📚 Prompt for AI Assistant
```
I need a layout with navigation for an AI docstring generator. Create:

1. src/components/Layout.tsx
   - Navigation bar with logo, nav links, and auth button
   - Logo: "🤖 AI Docstring Generator"
   - Nav links: Home (/) and History (/history)
   - Auth button: "Login" if logged out, user avatar if logged in
   - User dropdown menu: Sign Out option
   - Use React Router's Outlet for page content
   - Sticky navbar with glassmorphism styling
   - Responsive mobile menu (hamburger icon)
   - Active link highlighting

2. Update src/App.tsx
   - Set up React Router with Layout as parent route
   - Child routes: Home (/) and History (/history)
   - Wrap in AuthProvider

Use useAuth hook from src/contexts/AuthContext.tsx. Use lucide-react icons (Home, History, User, LogOut, Menu). Style with Tailwind.
```

---

## STAGE 9: Home & History Pages

**Assigned To:** Team Member 9  
**Estimated Time:** 4-5 hours  
**Dependencies:** Stages 3, 4, 6, 7 complete

### 📝 Task Description
Build the main application pages: Home (generation interface) and History (view past generations).

### 🎯 What to Build

1. **Home Page** (`src/pages/Home.tsx`):

   **Layout:**
   ```
   ┌─────────────────────────────────────┐
   │  📁 File Upload Component           │
   ├─────────────────────────────────────┤
   │  📋 Function List  │  💻 Code Editor│
   │  (detected funcs)  │  (original)    │
   ├────────────────────┴────────────────┤
   │  Format: [Google▾] [Generate]      │
   ├─────────────────────────────────────┤
   │  💻 Code Editor (generated result)  │
   │  [Download]                         │
   └─────────────────────────────────────┘
   ```

   **Workflow:**
   1. User uploads file → parse code → show functions
   2. User selects docstring format
   3. Click "Generate" → call API → show result
   4. Download generated code

   **State:**
   ```typescript
   const [originalCode, setOriginalCode] = useState('')
   const [functions, setFunctions] = useState<FunctionMetadata[]>([])
   const [format, setFormat] = useState<DocstringFormat>('google')
   const [generatedCode, setGeneratedCode] = useState('')
   const [loading, setLoading] = useState(false)
   ```

2. **History Page** (`src/pages/History.tsx`):

   **Layout:**
   ```
   ┌─────────────────────────────────────┐
   │  📜 Your Generation History         │
   ├─────────────────────────────────────┤
   │  ┌───────────────────────────────┐ │
   │  │ main.py · Google · 3 funcs    │ │
   │  │ Nov 18, 2025 3:45 PM          │ │
   │  │ [View] [Download] [Delete]    │ │
   │  └───────────────────────────────┘ │
   │  ┌───────────────────────────────┐ │
   │  │ utils.js · JSDoc · 5 funcs    │ │
   │  │ Nov 17, 2025 10:22 AM         │ │
   │  │ [View] [Download] [Delete]    │ │
   │  └───────────────────────────────┘ │
   └─────────────────────────────────────┘
   ```

   **Features:**
   - Load history on mount (from API or localStorage)
   - Display cards for each history entry
   - View modal to show original vs generated code
   - Download button for generated code
   - Delete button with confirmation
   - Empty state if no history
   - Filter/search (bonus)

### 💡 Key Logic

**Home Page:**
```typescript
const handleFileSelect = (content, filename, language) => {
  setOriginalCode(content)
  const parsed = language === 'python' 
    ? parsePythonCode(content) 
    : parseJavaScriptCode(content)
  setFunctions(parsed)
}

const handleGenerate = async () => {
  const response = await generateDocstrings({
    code: originalCode,
    language,
    format,
    functions
  })
  setGeneratedCode(response.code)
  await saveToHistory({...})
}
```

### ✅ Success Criteria
- Home page handles complete generation workflow
- History page loads and displays entries
- Can download generated files
- Delete works with confirmation
- Loading and error states handled
- Responsive layout

### 📚 Prompt for AI Assistant
```
I need the main pages for an AI docstring generator. Create:

1. src/pages/Home.tsx
   - File upload section (use FileUpload component)
   - Two-column layout: FunctionList + CodeEditor (original code)
   - Docstring format selector (dropdown: Google, NumPy, Sphinx, JSDoc)
   - Generate button (calls generateDocstrings API)
   - Result section: CodeEditor (generated code) + Download button
   - Handle file upload → parse code → show functions → generate → display result
   - Save to history after generation
   - Loading states and error handling

2. src/pages/History.tsx
   - Load history on mount (from getHistory API or localStorage)
   - Display history entries as cards
   - Each card shows: filename, format, function count, timestamp
   - Action buttons: View (modal with code), Download, Delete
   - Empty state message if no history
   - Responsive grid layout

Use all components from previous stages. Use api from src/services/api.ts and utils from src/utils/codeParser.ts. Style with Tailwind.
```

---

## STAGE 10: Supabase Backend Setup

**Assigned To:** Team Member 10  
**Estimated Time:** 3-4 hours  
**Dependencies:** All other stages complete

### 📝 Task Description
Set up Supabase project with database, authentication, and Edge Function for AI generation.

### 🎯 What to Build

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down: Project URL, Anon Key
   - Add to `.env` file

2. **Database Schema** (`supabase/migrations/20240101000000_create_docgen_history.sql`):

   ```sql
   -- Create history table
   CREATE TABLE docgen_history (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     filename TEXT NOT NULL,
     language TEXT NOT NULL CHECK (language IN ('python', 'javascript')),
     format TEXT NOT NULL CHECK (format IN ('google', 'numpy', 'sphinx', 'jsdoc')),
     original_code TEXT NOT NULL,
     generated_code TEXT NOT NULL,
     function_count INTEGER NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE docgen_history ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can read their own history
   CREATE POLICY "Users can read own history"
     ON docgen_history FOR SELECT
     USING (auth.uid() = user_id);

   -- Policy: Users can insert their own history
   CREATE POLICY "Users can insert own history"
     ON docgen_history FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can delete their own history
   CREATE POLICY "Users can delete own history"
     ON docgen_history FOR DELETE
     USING (auth.uid() = user_id);

   -- Create index for faster queries
   CREATE INDEX idx_docgen_history_user_id ON docgen_history(user_id);
   CREATE INDEX idx_docgen_history_created_at ON docgen_history(created_at DESC);
   ```

3. **Edge Function** (`supabase/functions/generate-docstring/index.ts`):

   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.1.1'

   const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
   const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

   serve(async (req) => {
     // Handle CORS
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const { code, language, format, functions } = await req.json()

       const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

       // Generate docstrings for each function
       const docstrings = []
       for (const func of functions) {
         const prompt = `Generate a ${format} style docstring for this ${language} ${func.type}:
         
Name: ${func.name}
Parameters: ${func.params.join(', ')}
Body:
\`\`\`
${func.body}
\`\`\`

Return only the docstring text without code blocks or markdown.`

         const result = await model.generateContent(prompt)
         const text = result.response.text()
         
         docstrings.push({
           name: func.name,
           docstring: text.trim()
         })
       }

       return new Response(
         JSON.stringify({ docstrings }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: corsHeaders }
       )
     }
   })
   ```

4. **Deploy Everything**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   
   # Deploy edge function
   supabase functions deploy generate-docstring
   
   # Set secret
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Enable Authentication**:
   - In Supabase Dashboard → Authentication
   - Enable Email provider
   - (Optional) Enable GitHub/Google OAuth

6. **Test the Backend**:
   - Try signing up a user
   - Test generation with sample code
   - Check database for history entries

### ✅ Success Criteria
- Supabase project created
- Database table created with RLS policies
- Edge function deployed successfully
- Authentication working
- Can generate docstrings via API
- History saved to database

### 📚 Prompt for AI Assistant
```
I need to set up the Supabase backend for an AI docstring generator. Help me:

1. Create database migration SQL file:
   - docgen_history table with fields: id, created_at, user_id, filename, language, format, original_code, generated_code, function_count
   - Enable Row Level Security (RLS)
   - Policies: users can read/insert/delete their own history
   - Create indexes for performance

2. Create Edge Function at supabase/functions/generate-docstring/index.ts:
   - Accept: code, language, format, functions
   - Use Google Generative AI SDK with Gemini 2.0
   - Generate docstring for each function with appropriate prompt
   - Return array of {name, docstring}
   - Handle CORS and errors

3. Provide deployment commands:
   - Link Supabase project
   - Apply migrations
   - Deploy edge function
   - Set GEMINI_API_KEY secret

Include complete SQL and TypeScript code. Use Deno for edge function.
```

---

## 🎯 SUMMARY: Task Assignment

| Stage | Team Member | Component | Time | Key Deliverable |
|-------|-------------|-----------|------|-----------------|
| 1 | Member 1 | Project Setup | 2-3h | Vite + TypeScript + Tailwind configured |
| 2 | Member 2 | TypeScript Types | 1-2h | All types defined in `types/index.ts` |
| 3 | Member 3 | Code Parser | 4-5h | Parser functions for Python/JS |
| 4 | Member 4 | API Service | 2-3h | Supabase client + API functions |
| 5 | Member 5 | Authentication | 3-4h | Auth context + login modal |
| 6 | Member 6 | File Upload & List | 3-4h | File upload + function list components |
| 7 | Member 7 | Code Editor | 2-3h | Monaco editor integration |
| 8 | Member 8 | Layout | 2-3h | Navigation + routing |
| 9 | Member 9 | Pages | 4-5h | Home + History pages |
| 10 | Member 10 | Supabase Backend | 3-4h | Database + Edge Function |

**Total Estimated Time:** 27-35 hours  
**Parallel Work:** Stages 2-7 can be done simultaneously after Stage 1  
**Critical Path:** 1 → 3 → 9 (must be sequential)

---

## 📚 Resources for Team

### Documentation
- **React**: https://react.dev
- **TypeScript**: https://typescriptlang.org
- **Vite**: https://vitejs.dev
- **TailwindCSS**: https://tailwindcss.com
- **Supabase**: https://supabase.com/docs
- **Monaco Editor**: https://microsoft.github.io/monaco-editor
- **Gemini AI**: https://ai.google.dev/docs

### Tools Needed
- Node.js 18+
- Git
- VS Code (recommended)
- Supabase account (free tier)
- Gemini API key (free tier: 60 requests/minute)

---

## 🚀 Getting Started as a Team

1. **Stage 1 team member** starts immediately and sets up the project
2. Once Stage 1 is done, **Stage 2-7** can work in parallel
3. **Stage 8-9** wait for dependencies
4. **Stage 10** can be done anytime but needed for full functionality
5. Everyone commits to separate branches and merges via PR
6. Daily standups to sync progress
7. Use the AI prompts provided to get started quickly

---

## ✅ Final Integration Checklist

- [ ] All components imported in pages
- [ ] All types used consistently
- [ ] Environment variables set
- [ ] Supabase backend deployed
- [ ] Authentication tested
- [ ] File upload → parse → generate → download workflow works
- [ ] History save and retrieval works
- [ ] Error handling throughout
- [ ] Responsive on mobile
- [ ] README updated with team names

---

**Good luck team! Each stage is critical to the success of the project. Follow the prompts, ask questions, and build something awesome! 🚀**
