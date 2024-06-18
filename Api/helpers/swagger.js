const swaggerJsDoc = require('swagger-jsdoc');
const packageJson = require('../package.json');

const docOptions = {
  swaggerDefinition: {
    openapi: '3.0.3',
    info: {
      title: 'Api', // Template
      version: packageJson.version
    },
    servers: [
      {
        url: process.env.API_URL
      }
    ],
    components: {
      securitySchemes: {
        accessToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken'
        },
        refreshToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'integer' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      },
      definitions: {
        ObjectId: {
          type: 'string',
          description: 'Object Id of the mongo resource.',
          example: '63208603c5869611eafc7fcd',
          pattern: '^[a-f\\d]{24}$'
        },
        UpdatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update time'
        }
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized. The user has no rigths on a specific resource or the credentials are wrong.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        Forbidden: {
          description: 'Forbidden. The user do not have rights on that kind of resource.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFound: {
          description: 'Not found. The resource do not exists or has been deleted.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        BadRequest: {
          description: 'Bad request. Something in the request is wrong or is not compliant with the schema validator',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ServerError: {
          description: 'Server error. Something in the server went really wrong.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    security: [
      {
        accessToken: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsDoc(docOptions);
