interface RequestContext {
  request: Request;
  env: Record<string, unknown>;
  params: Record<string, string>;
}

export async function onRequest(context: RequestContext) {
  return new Response(JSON.stringify({
    message: "Hello from Cloudflare Functions!",
    timestamp: new Date().toISOString()
  }), {
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
} 