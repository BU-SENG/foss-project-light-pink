# Contributing to AI Docstring Generator

Thank you for your interest in contributing to the AI Docstring Generator! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain why this enhancement would be useful**
- **Include examples or mockups** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you're adding functionality
4. **Update documentation** if needed
5. **Ensure tests pass** and code lints without errors
6. **Create a pull request** with a clear description

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase CLI (for backend changes)

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/your-username/ai-docstring-generator.git
cd ai-docstring-generator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# Start development server
npm run dev
```

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── services/      # API and external services
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── lib/           # Third-party library configs
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types that are reused

```typescript
// Good
interface UserProfile {
  id: string
  email: string
  createdAt: Date
}

// Avoid
const user: any = { ... }
```

### React Components

- Use functional components with hooks
- Name files with PascalCase (e.g., `FileUpload.tsx`)
- Keep components focused and single-purpose
- Use descriptive prop names

```typescript
// Good
interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void
  accept?: string
}

export default function FileUpload({ onFileSelect, accept }: FileUploadProps) {
  // Component logic
}
```

### Styling

- Use TailwindCSS utility classes
- Keep custom CSS minimal
- Follow responsive design principles
- Support dark mode

```tsx
// Good
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
    Title
  </h2>
</div>
```

### Code Organization

- Group related imports
- Order imports: React → third-party → local
- Use meaningful variable names
- Add comments for complex logic

```typescript
// React imports
import { useState, useEffect } from 'react'

// Third-party imports
import { supabase } from '@supabase/supabase-js'

// Local imports
import { useAuth } from '@/contexts/AuthContext'
import { generateDocstrings } from '@/services/api'
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for new features
- Test edge cases and error scenarios
- Use descriptive test names
- Keep tests focused and isolated

```typescript
describe('parsePythonCode', () => {
  it('should detect function definitions', () => {
    const code = 'def add(a, b):\n    return a + b'
    const functions = parsePythonCode(code)
    expect(functions).toHaveLength(1)
    expect(functions[0].name).toBe('add')
  })
})
```

## 📦 Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(parser): add support for TypeScript async functions

- Detect async function declarations
- Handle TypeScript type annotations
- Add tests for new functionality

Closes #123

fix(auth): resolve OAuth redirect issue

The redirect URL was not properly encoded, causing failures
with certain OAuth providers.

Fixes #456
```

## 🌳 Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
```bash
feature/batch-processing
fix/authentication-redirect
docs/update-readme
refactor/code-parser
test/add-parser-tests
```

## 🔍 Code Review Process

### For Contributors

1. Ensure your PR description clearly describes the changes
2. Link related issues
3. Respond to feedback promptly
4. Keep PRs focused (one feature/fix per PR)
5. Ensure CI checks pass

### For Reviewers

1. Be respectful and constructive
2. Explain the reasoning behind suggestions
3. Approve when ready or request changes
4. Merge after approval and passing checks

## 🚀 Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Push tag to trigger release workflow
5. GitHub Actions will build and deploy

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Include usage examples
- Keep documentation up-to-date

```typescript
/**
 * Parses Python code to extract function metadata
 * 
 * @param code - The Python source code to parse
 * @returns Array of function metadata objects
 * 
 * @example
 * ```typescript
 * const code = 'def add(a, b):\n    return a + b'
 * const functions = parsePythonCode(code)
 * console.log(functions[0].name) // 'add'
 * ```
 */
export function parsePythonCode(code: string): FunctionMetadata[] {
  // Implementation
}
```

### User Documentation

- Update README.md for new features
- Add examples and screenshots
- Keep setup instructions current
- Document breaking changes

## ❓ Getting Help

- **Documentation**: Check README.md and SUPABASE_SETUP.md
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (coming soon)

## 🎯 Areas to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers:
- Documentation improvements
- Adding tests
- UI enhancements
- Bug fixes

### High Priority

- Additional language support (TypeScript, Java, Go)
- Performance optimizations
- Accessibility improvements
- Mobile responsiveness

### Future Features

- Batch file processing
- VS Code extension
- CLI tool
- Custom templates
- Multi-language support

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Being respectful and inclusive
- Accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment or discriminatory comments
- Trolling or insulting remarks
- Personal or political attacks
- Publishing others' private information
- Other unethical or unprofessional conduct

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project credits

Thank you for contributing to making code documentation better for everyone! 🎉

---

## Questions?

Feel free to reach out:
- Create an issue for bugs or features
- Start a discussion for questions
- Email: your-email@example.com

**Happy Contributing! 🚀**
