import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Easerr API Documentation',
      version: '1.0.0',
      description: 'API documentation for Easerr job platform',
      contact: {
        name: 'API Support',
        url: 'https://easerr.com/support',
        email: 'support@easerr.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: '{productionUrl}',
        description: 'Production server',
        variables: {
          productionUrl: {
            default: 'https://api.easerr.com',
            description: 'Production API URL'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './swagger/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Easerr API Documentation"
  }));
  console.log('Swagger API docs available at /api-docs');
}; 