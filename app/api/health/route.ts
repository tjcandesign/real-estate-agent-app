export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Real Estate Agent App is running'
  });
}
// Fresh deployment trigger
