export async function GET() {
  return new Response(
    "This wedding pass is intended for the authorized event check-in scanner.",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
