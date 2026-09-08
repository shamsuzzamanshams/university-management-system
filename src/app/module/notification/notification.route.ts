import express from "express";

import { NotificationController } from "./notification.controller";
import { NotificationValidation } from "./notification.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";




const router = express.Router();




router.post(
    "/",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    validateRequest(
        NotificationValidation.createNotificationZodSchema
    ),
    NotificationController.createNotification
);



router.get(
    "/",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    NotificationController.getMyNotifications
);




router.patch(
    "/read-all",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    NotificationController.markAllNotificationsAsRead
);



router.get(
    "/:notificationId",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    NotificationController.getSingleNotification
);



router.patch(
    "/:notificationId",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    validateRequest(
        NotificationValidation.updateNotificationZodSchema
    ),
    NotificationController.updateNotification
);




router.patch(
    "/:notificationId/read",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    NotificationController.markNotificationAsRead
);




router.delete(
    "/:notificationId",
    auth(
        Role.SUPER_ADMIN,
        Role.DEPARTMENT_ADMIN,
        Role.INSTRUCTOR,
        Role.STUDENT
    ),
    NotificationController.deleteNotification
);


export const NotificationRoutes = router;