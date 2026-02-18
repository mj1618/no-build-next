export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blog-section">
      <h2>Blog Section</h2>
      {children}
    </div>
  );
}
