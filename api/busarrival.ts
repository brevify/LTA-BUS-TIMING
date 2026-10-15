/**
 * Serverless Bus Arrival Proxy Endpoint
 * Route: GET /api/busarrival?BusStopCode=<CODE>
 *
 * Pulls live transit arrival data from LTA DataMall v3 API:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=...
 * Headers:
 *   AccountKey: <LTA_ACCOUNT_KEY>
 *   accept: application/json
 */

const LTA_DATAMALL_V3_BASE = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

export default async function handler(req: any, res: any) {
  // CORS configuration for client-side and serverless consumers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported for this endpoint.',
    });
  }

  try {
    // Read query parameters
    const query = req.query || {};
    const rawBusStopCode = query.BusStopCode || query.busStopCode || query.code || '83139';
    const rawServiceNo = query.ServiceNo || query.serviceNo || query.service;

    const busStopCode = String(rawBusStopCode).trim();
    const serviceNo = rawServiceNo ? String(rawServiceNo).trim() : null;

    if (!busStopCode) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'BusStopCode query parameter is required (e.g. ?BusStopCode=83139).',
      });
    }

    // Read API key from environment variables (or fallback to client header if provided)
    const apiKey =
      process.env.LTA_ACCOUNT_KEY ||
      process.env.ACCOUNT_KEY ||
      req.headers['accountkey'] ||
      req.headers['account-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'Missing LTA_ACCOUNT_KEY',
        message:
          'LTA_ACCOUNT_KEY is not configured in environment variables. Please add LTA_ACCOUNT_KEY in your environment or .env file.',
        endpointRequested: `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${busStopCode}`,
        howToConfigure:
          'Obtain your API key from https://datamall.lta.gov.sg and set LTA_ACCOUNT_KEY="your_key" in your environment.',
      });
    }

    // Construct LTA DataMall v3 target URL
    const url = new URL(LTA_DATAMALL_V3_BASE);
    url.searchParams.set('BusStopCode', busStopCode);
    if (serviceNo) {
      url.searchParams.set('ServiceNo', serviceNo);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        AccountKey: apiKey,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Not JSON
      }

      return res.status(response.status).json({
        error: 'LTA DataMall Error',
        status: response.status,
        statusText: response.statusText,
        details: errorJson || errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('LTA Datamall proxy error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Failed to fetch bus arrival data from LTA DataMall.',
    });
  }
}
