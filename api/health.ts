/**
 * Serverless Health Check Endpoint
 * Route: GET /api/health
 */

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: {
    nodeEnv: string;
    hasLtaKey: boolean;
  };
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasLtaKey = Boolean(process.env.LTA_ACCOUNT_KEY || process.env.ACCOUNT_KEY);

  const payload: HealthResponse = {
    status: 'healthy',
    service: 'lta-datamall-bus-service',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasLtaKey,
    },
  };

  return res.status(200).json(payload);
}
