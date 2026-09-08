import { z } from "zod";

const createNotificationZodSchema = z.object({
    body: z.object({
        title: z
            .string("Notification title is required.")
            .min(1, "Notification title cannot be empty.")
            .max(200, "Notification title cannot exceed 200 characters."),

        message: z
            .string("Notification message is required.")
            .min(1, "Notification message cannot be empty."),

        userId: z
            .string("User ID is required.")
            .uuid("Invalid User ID format."),
    }),
});

const updateNotificationZodSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, "Notification title cannot be empty.")
            .max(200, "Notification title cannot exceed 200 characters.")
            .optional(),

        message: z
            .string()
            .min(1, "Notification message cannot be empty.")
            .optional(),

        isRead: z.boolean().optional(),
    }),
});

export const NotificationValidation = {
    createNotificationZodSchema,
    updateNotificationZodSchema,
};