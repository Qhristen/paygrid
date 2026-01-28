import { NextRequest, NextResponse } from 'next/server';
import { PayGrid } from '../core/paygrid';

export function createApiHandler(paygrid: PayGrid) {
  return async function handler(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const pathParts = pathname.split('/').filter(Boolean);
    const resource = pathParts[2]; // /api/paygrid/[resource]
    const id = pathParts[3];

    // Auth check
    const apiKey = req.headers.get('x-api-key');
    const isValid = apiKey ? await paygrid.validateApiKey(apiKey) : false;
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      if (resource === 'payment-intents') {
        if (req.method === 'POST') {
          const body = await req.json();
          const intent = await paygrid.createPaymentIntent(body);
          return NextResponse.json(intent);
        }

        if (req.method === 'GET' && id) {
          const intent = await paygrid.getPayment(id);
          if (!intent) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
          return NextResponse.json(intent);
        }
      }

      if (resource === 'payments') {
        if (req.method === 'GET') {
          const payments = await paygrid.getPayments();
          return NextResponse.json(payments);
        }
      }

      if (resource === 'analytics') {
        if (req.method === 'GET') {
          const stats = await paygrid.getAnalytics();
          return NextResponse.json(stats);
        }
      }

      if (resource === 'api-keys') {
        if (req.method === 'POST') {
          const { name } = await req.json();
          const result = await paygrid.createApiKey(name);
          return NextResponse.json(result);
        }
        
        if (req.method === 'GET') {
          const keys = await paygrid.listApiKeys();
          return NextResponse.json(keys);
        }
      }

      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    } catch (error: any) {
      console.error('API Error:', error);
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
  };
}
