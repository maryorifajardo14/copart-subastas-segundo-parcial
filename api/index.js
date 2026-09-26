// Entry point para Vercel Serverless Functions.
// Vercel invoca este módulo como handler (req, res); Express es compatible directamente.
const app = require('../server/src/app');

module.exports = app;
