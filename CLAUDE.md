# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

A production-ready React frontend template designed for code agents to build modern websites and web applications. Running in an E2B sandbox environment with React 19, TypeScript, Tailwind CSS, and comprehensive UI components.

## 🔧 Development Commands

**Primary Command:**
- `npm run check:safe` - TypeScript type checking + ESLint validation (run when ready to validate)

**⚠️ CRITICAL E2B ENVIRONMENT RESTRICTIONS:**
- **NEVER run `npm run dev` or `npm start`** - These will fail in E2B containers
- **ALWAYS use `npm run check:safe`** for validation - This is your primary development tool

## 📋 Development Workflow

**⚠️ CRITICAL: Explore Before Building**
1. **Explore Codebase First**: Read existing files, check available UI components, understand current structure
2. **🚨 Validate & Read**: Verify Tailwind classes, shadcn/ui components, TypeScript setup. Read any relevant components completely to understand their capabilities
3. **Build**: Edit `src/routes/index.tsx` (main development target)
4. **Customize**: Update `index.html` title (line 14) & meta description (line 10)
5. **Validate**: Run `npm run check:safe` when you think the build should succeed
6. **Fix Issues**: Address any TypeScript/ESLint errors shown

## 🏗️ Architecture Overview

**Core Framework Stack:**
- **React 19** with TypeScript (strict: false, but noImplicitAny + strictNullChecks enabled)
- **TanStack Router** for routing with auto-generated route tree
- **TanStack Query** for server state management with 5min stale time
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **shadcn/ui** components (New York style, zinc base color)

**Key Architectural Patterns:**
- **URL-based Configuration**: `src/main.tsx` parses build URLs to extract userId/projectId/taskId
- **Auth Integration**: Auto-initialized JWT handling in `src/sdk/core/auth.ts`
- **File-based Routing**: Routes auto-generated from `src/routes/` directory

## 📁 Project Structure

**Entry Points:**
- `src/routes/index.tsx` - **Primary development target** for all applications
- `index.html` - Customize title (line 14) and meta description (line 10)

**Core System Files:**
- `src/main.tsx` - App initialization, URL parsing, QueryClient setup
- `src/routes/__root.tsx` - Root layout with navigation
- `src/routeTree.gen.ts` - Auto-generated route tree (do not edit)

**Component Architecture:**
- `src/components/ui/` - 40+ shadcn/ui components (accordion, button, card, form, etc.)
- `src/components/` - Custom components (`UploadButton`, `FloatingBanner`)
- `src/hooks/` - Global hooks
- `src/lib/` - Utilities (`utils.ts` with `cn()` helper, creao-platform utilities)

**Asset Management:**
- `src/assets/` - All static assets (images, icons, fonts, etc.)
- Import using `@/assets/` alias with ES6 imports: `import logo from '@/assets/logo.svg'`
- Vite automatically handles asset optimization and bundling

## 📝 Development Guidelines

**Component Priority:** shadcn/ui components (`@/components/ui/`) → custom components → create new (last resort)

**TypeScript Conventions:**
- TypeScript required, use `@/` path alias, `cn()` for conditional styling
- Mark types in imports - Due to verbatimModuleSyntax, use `import { type Type, value }` syntax
- Use `React.ComponentProps<"div">` for HTML element props

**Code Patterns:**
- Icons: `lucide-react` only
- Forms: React Hook Form + Zod validation
- File naming: kebab-case for files, PascalCase for components

**Application Focus:**
- Build functional UIs with real data processing (no mock data)
- Support: landing pages, interactive tools, dashboards, file processing

## ⚠️ Common Issues & Solutions

1. **Component Ignorance**: Reading filenames but not contents → using raw libraries when abstractions exist
2. **TypeScript Import Syntax**: Due to verbatimModuleSyntax, mark types with `type` keyword: `import { type Type, value }`
3. **TypeScript Props**: Use `React.ComponentProps<"div">` for HTML element props
4. **Path Imports**: Always use `@/` alias, verify paths exist  
5. **E2B Containers**: Server uses `0.0.0.0`, file watching uses polling

## 🎯 Success Checklist

- [ ] `index.html` customized (title/meta description)
- [ ] Functionality works with real user input
- [ ] No TypeScript/ESLint errors
- [ ] `npm run check:safe` passes
