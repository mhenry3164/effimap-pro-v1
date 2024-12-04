"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.auth = exports.db = void 0;
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
exports.db = admin.firestore();
exports.auth = admin.auth();
exports.storage = admin.storage();
//# sourceMappingURL=admin.js.map