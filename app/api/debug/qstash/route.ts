import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const qstashToken = process.env.QSTASH_TOKEN;
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  return NextResponse.json({
    qstash: {
      tokenConfigured: !!qstashToken,
      tokenPreview: qstashToken ? qstashToken.substring(0, 20) + '...' : 'NOT SET',
      currentSigningKeyConfigured: !!currentKey,
      nextSigningKeyConfigured: !!nextKey,
    },
    urls: {
      requestOrigin: requestUrl.origin,
      requestHost: requestUrl.host,
      baseUrl: baseUrl,
      webhookUrl: `${baseUrl}/api/notifications/qstash-webhook`,
      scheduleUrl: `${baseUrl}/api/notifications/schedule-qstash`,
    },
    environment: {
      VERCEL_URL: process.env.VERCEL_URL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    },
    timestamp: new Date().toISOString(),
  });
}
