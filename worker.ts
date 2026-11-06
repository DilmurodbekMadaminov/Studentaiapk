// Cloudflare Worker Entry point for Student AI
// Supports both "wrangler deploy" (Cloudflare Workers with Static Assets)
// and handles all /api/* backend routes directly at the Cloudflare Edge.

import { onRequest } from "./functions/api/[[catchall]]";

interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // If it's an API route, process it with Edge Serverless API handler
    if (url.pathname.startsWith("/api/")) {
      return onRequest({
        request,
        env,
        params: { catchall: url.pathname.replace(/^\/api\/?/, "").split("/") },
        next: async () => {
          if (env.ASSETS) {
            return env.ASSETS.fetch(request);
          }
          return new Response("Not found", { status: 404 });
        }
      });
    }

    // Serve static assets (HTML, CSS, JS, Images, etc.) via Cloudflare Assets Binding
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      
      // SPA Fallback: Return index.html for client-side routing
      const indexRequest = new Request(new URL("/index.html", request.url).toString(), request);
      return env.ASSETS.fetch(indexRequest);
    }

    return new Response("Student AI Pro - Edge Worker Online", {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
