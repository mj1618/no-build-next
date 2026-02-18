export default function BlogPostPage({ params }: { params: Record<string, string> }) {
  return (
    <div>
      <h1>Blog Post: {params.slug}</h1>
      <p>This is a blog post.</p>
    </div>
  );
}
