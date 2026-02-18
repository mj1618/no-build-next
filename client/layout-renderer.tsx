import { Suspense, type ComponentType, type ReactNode } from "react";
import { ErrorBoundary } from "/client/error-boundary.tsx";

interface LayoutRendererProps {
  layouts: ComponentType<{ children: ReactNode; params: Record<string, string> }>[];
  page: ComponentType<{ params: Record<string, string> }>;
  params: Record<string, string>;
  loading?: ComponentType;
  error?: ComponentType<{ error: Error; reset: () => void }>;
}

export function LayoutRenderer({ layouts, page: Page, params, loading, error }: LayoutRendererProps) {
  let content: ReactNode = <Page params={params} />;

  if (loading) {
    const Loading = loading;
    content = <Suspense fallback={<Loading />}>{content}</Suspense>;
  }

  if (error) {
    content = <ErrorBoundary fallback={error} params={params}>{content}</ErrorBoundary>;
  }

  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i];
    content = <Layout params={params}>{content}</Layout>;
  }

  return <>{content}</>;
}
