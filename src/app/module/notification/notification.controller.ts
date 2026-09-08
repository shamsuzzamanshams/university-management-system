import { Request, Response } from "express";
import httpStatus from "http-status";

import { NotificationService } from "./notification.service";

import { RequstUser } from "../../middleware/checkAuth";
import { sendResponse } from "../../utils/sendResponse";



const createNotification = async (
    req: Request,
    res: Response
) => {
    const result = await NotificationService.createNotification(
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Notification created successfully.",
        data: result,
    });
};




const getMyNotifications = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const userId = req.user?.userId;

    const result =
        await NotificationService.getMyNotifications(userId!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notifications retrieved successfully.",
        data: result,
    });
};




const getSingleNotification = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    const result =
        await NotificationService.getSingleNotification(
            notificationId as string,
            userId!
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification retrieved successfully.",
        data: result,
    });
};




const updateNotification = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    const result =
        await NotificationService.updateNotification(
            notificationId as string,
            userId!,
            req.body
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification updated successfully.",
        data: result,
    });
};




const markNotificationAsRead = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    const result =
        await NotificationService.markNotificationAsRead(
            notificationId as string,
            userId!
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification marked as read.",
        data: result,
    });
};




const markAllNotificationsAsRead = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const userId = req.user?.userId;

    const result =
        await NotificationService.markAllNotificationsAsRead(
            userId!
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All notifications marked as read.",
        data: result,
    });
};




const deleteNotification = async (
    req: Request & { user?: RequstUser },
    res: Response
) => {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    await NotificationService.deleteNotification(
        notificationId as string,
        userId!
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification deleted successfully.",
        data: null,
    });
};


export const NotificationController = {
    createNotification,
    getMyNotifications,
    getSingleNotification,
    updateNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};