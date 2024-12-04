import * as cors from 'cors';
import * as functions from 'firebase-functions';

const corsOptions = {
  origin: true, // This allows all origins in development
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'Content-Length',
    'User-Agent',
    'x-goog-resumable'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 3600
};

const corsMiddleware = cors(corsOptions);

export const corsHandler = async (req: functions.https.Request, res: functions.Response, next: Function) => {
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.set('Access-Control-Max-Age', String(corsOptions.maxAge));
    res.status(204).send('');
    return;
  }

  return new Promise((resolve, reject) => {
    corsMiddleware(req, res, (err: any) => {
      if (err) {
        console.error('CORS Error:', err);
        reject(err);
      } else {
        resolve(next());
      }
    });
  });
};
