import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const CODE = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  ERROR: 500
} as const;

export const success = <T>(c: Context, data: T, message = "操作成功") => {
  return c.json({
    code: CODE.SUCCESS,
    message,
    data
  });
};

export const fail = (c: Context, message = "操作失败", code: ContentfulStatusCode = CODE.ERROR) => {
  return c.json(
    {
      code,
      message,
      data: null
    },
    code
  );
};
