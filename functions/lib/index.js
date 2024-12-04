"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentStatus = exports.getSystemMetrics = void 0;
const functions = require("firebase-functions");
const cors_1 = require("./middleware/cors");
exports.getSystemMetrics = functions.https.onRequest(async (request, response) => {
    try {
        // Set CORS headers for all responses
        response.set('Access-Control-Allow-Origin', request.headers.origin || '*');
        response.set('Access-Control-Allow-Credentials', 'true');
        await (0, cors_1.corsHandler)(request, response, async () => {
            // Your existing getSystemMetrics logic here
            const metrics = {
                cpu: 45,
                memory: 60,
                storage: 30,
                activeConnections: 150,
                lastUpdated: new Date()
            };
            response.json(metrics);
        });
    }
    catch (error) {
        console.error('Error in getSystemMetrics:', error);
        // Ensure CORS headers are set even for error responses
        response.set('Access-Control-Allow-Origin', request.headers.origin || '*');
        response.set('Access-Control-Allow-Credentials', 'true');
        response.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getComponentStatus = functions.https.onRequest(async (request, response) => {
    try {
        // Set CORS headers for all responses
        response.set('Access-Control-Allow-Origin', request.headers.origin || '*');
        response.set('Access-Control-Allow-Credentials', 'true');
        await (0, cors_1.corsHandler)(request, response, async () => {
            // Your existing getComponentStatus logic here
            const status = {
                'api': 'operational',
                'database': 'operational',
                'storage': 'operational',
                'auth': 'operational'
            };
            response.json(status);
        });
    }
    catch (error) {
        console.error('Error in getComponentStatus:', error);
        // Ensure CORS headers are set even for error responses
        response.set('Access-Control-Allow-Origin', request.headers.origin || '*');
        response.set('Access-Control-Allow-Credentials', 'true');
        response.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
//# sourceMappingURL=index.js.map