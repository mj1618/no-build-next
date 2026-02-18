# no-build-next

Next.js App Router conventions without a build step.

A lightweight dev server that gives you file-based routing, nested layouts, and instant TypeScript/JSX support — all without bundling. Files are transformed on the fly with esbuild in microseconds. Server startup is sub-second. File changes appear instantly.

## Quick start

```bash
npx no-build-next
```

This starts a dev server at `http://localhost:3000`. Create an `app/` directory with `page.tsx` and `layout.tsx` files and you're off.

## Project structure

The server expects a Next.js App Router file structure:

```
your-project/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (/)
│   ├── loading.tsx         # Loading state (Suspense boundary)
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   ├── about/
│   │   └── page.tsx        # /about
│   └── blog/
│       ├── layout.tsx      # Nested layout for /blog/*
│       ├── page.tsx        # /blog
│       └── [slug]/
│           └── page.tsx    # /blog/:slug (dynamic route)
├── components/             # Shared components (optional)
├── lib/                    # Utilities (optional)
├── public/                 # Static assets (optional)
└── package.json
```

## Routing conventions

Routes are defined by placing `page.tsx` files inside the `app/` directory. The folder structure determines the URL.

### Pages

Every `page.tsx` becomes a route. The default export is the page component:

```tsx
export default function AboutPage() {
  return <h1>About</h1>;
}
```

### Dynamic routes

Use bracket syntax for dynamic segments:

```
app/blog/[slug]/page.tsx    →  /blog/:slug
```

The component receives params as a prop:

```tsx
export default function BlogPost({ params }: { params: Record<string, string> }) {
  return <h1>{params.slug}</h1>;
}
```

### Catch-all routes

Use spread syntax for catch-all segments:

```
app/docs/[...path]/page.tsx  →  /docs/*
```

### Route groups

Wrap folder names in parentheses to organize routes without affecting the URL:

```
app/(marketing)/about/page.tsx  →  /about
app/(shop)/products/page.tsx    →  /products
```

### Layouts

`layout.tsx` files wrap all child routes. They nest automatically:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Layout files can use `<html>`, `<body>`, and `<head>` tags — these are automatically transformed into pass-through wrappers so they don't conflict with the actual document.

### Loading states

A `loading.tsx` file provides a fallback UI while the page loads:

```tsx
export default function Loading() {
  return <p>Loading...</p>;
}
```

### Error boundaries

An `error.tsx` file catches errors in its subtree:

```tsx
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not found

A `not-found.tsx` file renders when no route matches:

```tsx
export default function NotFound() {
  return <h1>404 — Page not found</h1>;
}
```

## Path aliases

Import from anywhere in your project using the `@/` prefix:

```tsx
import { Button } from "@/components/Button";
```

This resolves to the project root. Extensions are optional — the server resolves `.tsx`, `.ts`, `.jsx`, `.js`, and `index` files automatically.

## Static assets

Files in `public/` are served as-is at the root path. For example, `public/logo.png` is available at `/logo.png`.

## Live reload

The server watches for file changes in `app/`, `components/`, `lib/`, `utils/`, and `data/` directories. When a file changes, the browser reloads automatically via Server-Sent Events.

## Configuration

### Port

Set the `PORT` environment variable:

```bash
PORT=8080 npx no-build-next
```

### React

React 18 or 19 is loaded from [esm.sh](https://esm.sh) via an import map — no local React install is required for the runtime. If you want type checking, install React as a dev dependency:

```bash
npm install -D react react-dom @types/react @types/react-dom
```

## CLI

```
Usage
  $ npx no-build-next
  $ PORT=8080 npx no-build-next

Options
  -h, --help         Show help
  -v, --version      Show version number

Environment
  PORT  Port to listen on (default: 3000)
```

## How it works

1. The server starts and scans `app/` to build a route table
2. Page requests serve an HTML shell with an import map pointing to React on esm.sh
3. A client-side router fetches the route table and dynamically imports page/layout modules
4. TypeScript and JSX files are transformed on the fly with esbuild (single-file, no bundling)
5. Transforms are cached in memory, keyed by file path and modification time
6. File changes invalidate the cache and trigger a browser reload via SSE

## Limitations

This is a development tool. It does not support:

- Production builds or bundling
- Server-side rendering (SSR)
- API routes or server actions
- Middleware
- Static generation
- Image or font optimization

## License

ISC
