import { z } from 'zod';
import { insertTileSchema, insertMessageSchema, tiles, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tiles: {
    list: {
      method: 'GET' as const,
      path: '/api/tiles',
      responses: {
        200: z.array(z.custom<typeof tiles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tiles',
      input: insertTileSchema,
      responses: {
        201: z.custom<typeof tiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tiles/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  chat: {
    history: {
      method: 'GET' as const,
      path: '/api/chat',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/chat',
      input: z.object({ message: z.string() }),
      responses: {
        200: z.custom<typeof messages.$inferSelect>(), // Returns the AI response
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
