export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="app">
      <nav>
        <a href="/">Home</a> | <a href="/about">About</a> | <a href="/blog">Blog</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
