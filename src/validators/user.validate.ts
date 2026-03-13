import * as z from "zod";
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: z.ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body)
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const pretty = z.prettifyError(error);
          return res.status(400).json({ error: pretty });
        }

        // erro inesperado
        return res.status(500).json({ error: 'Internal server error' });
      };

    };
