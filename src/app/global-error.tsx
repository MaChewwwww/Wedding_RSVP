"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#fff9ef",
          color: "#3f3a37",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <h1>Something went wrong.</h1>
            <p>Please reload the application.</p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{ minHeight: 44, padding: "0.65rem 1rem" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
