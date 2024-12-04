"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsHandler = void 0;
const cors = require("cors");
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
const corsHandler = async (req, res, next) => {
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
        corsMiddleware(req, res, (err) => {
            if (err) {
                console.error('CORS Error:', err);
                reject(err);
            }
            else {
                resolve(next());
            }
        });
    });
};
exports.corsHandler = corsHandler;
//# sourceMappingURL=cors.js.map