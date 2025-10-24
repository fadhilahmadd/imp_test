import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export function apiSuccess<TStatusCode extends ContentfulStatusCode = 200>(
  c: Context,
  message: string,
  data: any,
  statusCode: TStatusCode = 200 as TStatusCode
) {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    statusCode
  );
}

