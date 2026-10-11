import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Vercel Multi-Service BFF Proxy
 * Forwards requests from the admin frontend to the bound internal backend service.
 * In Vercel Services, internal services are reachable via injected binding variables.
 */
export const config = {
  api: {
    bodyParser: false, // Stream body directly for JSON or arbitrary payloads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Resolve target internal service URL from Vercel binding
  const targetBaseUrl =
    process.env.DEFI_ORCHESTRATOR_URL ||
    process.env.BACKEND_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_ADMIN_API_URL ||
    'http://localhost:8000';

  const { path } = req.query;
  const subPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Preserve query string
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const queryString = queryIndex !== -1 ? req.url?.substring(queryIndex) : '';
  
  const targetUrl = new URL(`/api/admin/${subPath}${queryString}`, targetBaseUrl);

  // 2. Prepare headers
  const forwardHeaders: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (key.toLowerCase() !== 'host' && val) {
      forwardHeaders[key] = Array.isArray(val) ? val.join(', ') : val;
    }
  }

  // 3. Read request body if present
  let bodyBuffer: Buffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    bodyBuffer = Buffer.concat(chunks);
  }

  try {
    const backendRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: bodyBuffer,
    });

    // Forward response status and headers
    res.status(backendRes.status);
    backendRes.headers.forEach((val, key) => {
      // Don't forward content-encoding if decompressed
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, val);
      }
    });

    const resData = await backendRes.arrayBuffer();
    res.send(Buffer.from(resData));
  } catch (error: any) {
    console.error(`Failed to forward request to bound internal service [${targetUrl}]:`, error);
    res.status(502).json({
      error: 'Bad Gateway',
      detail: `Unable to reach bound service at ${targetBaseUrl}: ${error.message}`,
    });
  }
}
