export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "1rem", color: "red" }}>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
