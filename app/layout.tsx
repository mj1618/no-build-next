export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="app">
          <nav>
            <a href="/">Home</a> | <a href="/about">About</a> | <a href="/blog">Blog</a>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
