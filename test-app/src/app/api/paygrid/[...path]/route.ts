import { initPayGrid, createApiHandler } from '@qhristen/paygrid/server';

// Initialize PayGrid (this is a singleton-like initialization for the route)
let paygridPromise: ReturnType<typeof initPayGrid> | null = null;

async function getPayGrid() {
  if (!paygridPromise) {
    paygridPromise = initPayGrid();
  }
  return paygridPromise;
}

export async function GET(req: Request) {
  console.log('GET Request to PayGrid API:', req.url);
  const paygrid = await getPayGrid();
  const handler = createApiHandler(paygrid);
  return handler(req as any);
}

export async function POST(req: Request) {
  const paygrid = await getPayGrid();
  const handler = createApiHandler(paygrid);
  return handler(req as any);
}

export async function DELETE(req: Request) {
  const paygrid = await getPayGrid();
  const handler = createApiHandler(paygrid);
  return handler(req as any);
}
