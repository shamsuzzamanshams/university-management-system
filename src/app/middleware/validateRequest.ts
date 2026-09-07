import z from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

// FIX: Used z.ZodObject<any, any, any> instead of AnyZodObject
export const validateRequest = (zodSchema: z.ZodObject) => {
	return catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			// Check if the Zod schema expects a root-level "body" shape
			const hasBodyWrapper = "body" in zodSchema.shape;

			if (hasBodyWrapper) {
				// For nested schemas (like your Department schema)
				const result = await zodSchema.safeParseAsync({
					body: req.body || {},
					query: req.query || {},
					params: req.params || {},
				});

				if (!result.success) {
					// FIX: Read message from the first index [0] of the issues array
					throw new Error(result.error.issues[0].message);
				}
				req.body = result.data.body;
			} else {
				// For old flat schemas (like your original Login/Register schemas)
				const result = await zodSchema.safeParseAsync(req.body || {});

				if (!result.success) {
					// FIX: Read message from the first index [0] of the issues array
					throw new Error(result.error.issues[0].message);
				}
				req.body = result.data;
			}

			next();
		}
	);
};
