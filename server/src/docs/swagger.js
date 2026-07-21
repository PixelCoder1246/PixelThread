const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi');

const setupSwagger = (app) => {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: 'PixelThread API Docs',
      customfavIcon: '',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        syntaxHighlight: { theme: 'monokai' },
      },
    })
  );

  app.get('/api/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openapi);
  });
};

module.exports = setupSwagger;
