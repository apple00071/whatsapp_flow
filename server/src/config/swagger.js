/**
 * Swagger/OpenAPI Configuration
 * Generates API documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Programmable Messaging Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for automating WhatsApp messaging with multi-language SDK support',
      contact: {
        name: 'API Support',
        email: 'support@yourplatform.com',
        url: 'https://yourplatform.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
      {
        url: `https://api.yourplatform.com/api/${config.apiVersion}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for external applications',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user', 'developer'] },
            is_active: { type: 'boolean' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Session: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            phone_number: { type: 'string' },
            status: {
              type: 'string',
              enum: ['initializing', 'qr', 'connected', 'disconnected', 'failed'],
            },
            qr_code: { type: 'string', nullable: true },
            connected_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            session_id: { type: 'string', format: 'uuid' },
            direction: { type: 'string', enum: ['inbound', 'outbound'] },
            from: { type: 'string' },
            to: { type: 'string' },
            type: {
              type: 'string',
              enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact'],
            },
            content: { type: 'string', nullable: true },
            media_url: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            session_id: { type: 'string', format: 'uuid' },
            phone_number: { type: 'string' },
            name: { type: 'string', nullable: true },
            is_blocked: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            session_id: { type: 'string', format: 'uuid' },
            whatsapp_group_id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            participant_count: { type: 'integer' },
            is_admin: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            session_id: { type: 'string', format: 'uuid', nullable: true },
            url: { type: 'string', format: 'uri' },
            events: {
              type: 'array',
              items: { type: 'string' },
            },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            key_prefix: { type: 'string' },
            is_active: { type: 'boolean' },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'integer' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 401,
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 403,
                  message: 'Insufficient permissions',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 404,
                  message: 'Resource not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 400,
                  message: 'Validation error',
                  details: [
                    {
                      field: 'email',
                      message: 'Valid email is required',
                    },
                  ],
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 429,
                  message: 'Too many requests, please try again later',
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKeyAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Sessions',
        description: 'WhatsApp session management',
      },
      {
        name: 'Messages',
        description: 'Send and retrieve messages',
      },
      {
        name: 'Contacts',
        description: 'Contact management',
      },
      {
        name: 'Groups',
        description: 'Group management',
      },
      {
        name: 'Webhooks',
        description: 'Webhook configuration',
      },
      {
        name: 'API Keys',
        description: 'API key management',
      },
      {
        name: 'Admin',
        description: 'Administrative operations',
      },
      {
        name: 'Health',
        description: 'System health and monitoring',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

