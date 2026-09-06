import z from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

export const validateRequest = (zodSchema: z.ZodObject) => {
	return catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			// Parse the request structures against your nested Zod schema safely
			const result = await zodSchema.safeParseAsync({
				body: req.body || {},
				query: req.query || {},
				params: req.params || {},
				cookies: req.cookies || {}
			});

			if (!result.success) {
				// Safely forward the specific Zod error message
				throw new Error(result.error.issues[0].message);
			}

			// FIX: Only overwrite req.body. Leave query and params read-only.
			req.body = result.data.body;

			next();
		}
	);
};
