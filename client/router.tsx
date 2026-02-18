import { useState, useEffect, useCallback, type ComponentType, type ReactNode } from "react";
import { LayoutRenderer } from "/client/layout-renderer.tsx";

interface ClientRoute {
  pattern: string;
  pagePath: string;
  layoutPaths: string[];
  paramNames: string[];
  loadingPath?: string | null;
  errorPath?: string | null;
  notFoundPath?: string | null;
}

interface RouteMatch {
  route: ClientRoute;
  params: Record<string, string>;
}

interface LoadedRoute {
  page: ComponentType<{ params: Record<string, string> }>;
  layouts: ComponentType<{ children: ReactNode; params: Record<string, string> }>[];
  params: Record<string, string>;
  loading?: ComponentType;
  error?: ComponentType<{ error: Error; reset: () => void }>;
}

// Global navigation function — exported so other modules (e.g. <Link>) can use it
let routerNavigate: ((href: string) => void) | null = null;

export function navigate(href: string) {
  if (routerNavigate) {
    routerNavigate(href);
  }
}

/**
 * Compile a route pattern to a regex, matching server-side logic.
 */
function compilePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

  if (pattern === "/") {
    return { regex: /^\/$/, paramNames };
  }

  const segments = pattern.split("/").filter(Boolean);
  const regexParts: string[] = [];

  for (const seg of segments) {
    // Catch-all: [...slug]
    const catchAllMatch = seg.match(/^\[\.\.\.(\w+)\]$/);
    if (catchAllMatch) {
      paramNames.push(catchAllMatch[1]);
      regexParts.push("(.+)");
      continue;
    }

    // Dynamic segment: [param]
    const dynamicMatch = seg.match(/^\[(\w+)\]$/);
    if (dynamicMatch) {
      paramNames.push(dynamicMatch[1]);
      regexParts.push("([^/]+)");
      continue;
    }

    // Static segment — escape regex chars
    regexParts.push(seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }

  const regexStr = "^/" + regexParts.join("/") + "$";
  return { regex: new RegExp(regexStr), paramNames };
}

/**
 * Match a pathname against the route table.
 */
function matchRoute(pathname: string, routes: ClientRoute[]): RouteMatch | null {
  for (const route of routes) {
    const { regex, paramNames } = compilePattern(route.pattern);
    const match = pathname.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = match[i + 1];
      }
      return { route, params };
    }
  }
  return null;
}

/**
 * Dynamically import a page and its layout chain, plus optional boundary modules.
 */
async function loadRouteModules(routeMatch: RouteMatch): Promise<LoadedRoute> {
  const { route, params } = routeMatch;

  // Import page and all layouts in parallel
  const [pageModule, ...layoutModules] = await Promise.all([
    import(/* @vite-ignore */ route.pagePath),
    ...route.layoutPaths.map((p) => import(/* @vite-ignore */ p)),
  ]);

  // Load optional boundary modules in parallel
  const [loadingModule, errorModule] = await Promise.all([
    route.loadingPath ? import(/* @vite-ignore */ route.loadingPath) : null,
    route.errorPath ? import(/* @vite-ignore */ route.errorPath) : null,
  ]);

  return {
    page: pageModule.default,
    layouts: layoutModules.map((m) => m.default),
    params,
    loading: loadingModule?.default,
    error: errorModule?.default,
  };
}

/**
 * Find the root-level not-found path from the route table.
 * The route scanner inherits notFoundPath, so any route that has one
 * can provide it — we pick the first one that exists (they all inherit
 * from root if app/not-found.tsx exists).
 */
function findNotFoundPath(routes: ClientRoute[]): string | null {
  for (const route of routes) {
    if (route.notFoundPath) return route.notFoundPath;
  }
  return null;
}

export function Router() {
  const [routes, setRoutes] = useState<ClientRoute[] | null>(null);
  const [loaded, setLoaded] = useState<LoadedRoute | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundComponent, setNotFoundComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resolve a pathname: match route, load modules, update state
  const resolve = useCallback(
    async (pathname: string, routeTable: ClientRoute[]) => {
      setNotFound(false);
      setError(null);

      const match = matchRoute(pathname, routeTable);
      if (!match) {
        setNotFound(true);
        setLoaded(null);

        // Try to load a custom not-found component
        const nfPath = findNotFoundPath(routeTable);
        if (nfPath) {
          try {
            const nfModule = await import(/* @vite-ignore */ nfPath);
            setNotFoundComponent(() => nfModule.default);
          } catch {
            // Fall back to hardcoded 404
            setNotFoundComponent(null);
          }
        }
        return;
      }

      try {
        const result = await loadRouteModules(match);
        setLoaded(result);
      } catch (err: any) {
        console.error("Failed to load route modules:", err);
        setError(err.message || "Failed to load page");
      }
    },
    [],
  );

  // Fetch route table on mount
  useEffect(() => {
    let cancelled = false;

    fetch("/__routes")
      .then((res) => res.json())
      .then(({ routes: fetchedRoutes }: { routes: ClientRoute[] }) => {
        if (cancelled) return;
        setRoutes(fetchedRoutes);
        resolve(window.location.pathname, fetchedRoutes);
      })
      .catch((err) => {
        console.error("Failed to fetch routes:", err);
        if (!cancelled) setError("Failed to fetch route table");
      });

    return () => {
      cancelled = true;
    };
  }, [resolve]);

  // Register global navigate function and popstate listener
  useEffect(() => {
    if (!routes) return;

    routerNavigate = (href: string) => {
      history.pushState({}, "", href);
      resolve(href, routes);
    };

    const onPopState = () => {
      resolve(window.location.pathname, routes);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      routerNavigate = null;
      window.removeEventListener("popstate", onPopState);
    };
  }, [routes, resolve]);

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}><h1>Error</h1><p>{error}</p></div>;
  }

  if (!routes) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (notFound) {
    if (notFoundComponent) {
      const NotFound = notFoundComponent;
      return <NotFound />;
    }
    return <div style={{ padding: "2rem" }}><h1>404 — Page not found</h1></div>;
  }

  if (!loaded) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <LayoutRenderer
      layouts={loaded.layouts}
      page={loaded.page}
      params={loaded.params}
      loading={loaded.loading}
      error={loaded.error}
    />
  );
}
