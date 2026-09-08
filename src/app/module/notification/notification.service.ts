import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
    ICreateNotification,
    IUpdateNotification,
} from "./notification.interface";




const createNotification = async (payload: ICreateNotification) => {
    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
    });

    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found."
        );
    }

    const notification = await prisma.notification.create({
        data: {
            title: payload.title.trim(),
            message: payload.message.trim(),
            userId: payload.userId,
        },
    });

    return notification;
};




const getMyNotifications = async (userId: string) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications;
};




const getSingleNotification = async (
    notificationId: string,
    userId: string
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Notification not found."
        );
    }

    return notification;
};




const updateNotification = async (
    notificationId: string,
    userId: string,
    payload: IUpdateNotification
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Notification not found."
        );
    }

    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            ...(payload.title !== undefined && {
                title: payload.title.trim(),
            }),

            ...(payload.message !== undefined && {
                message: payload.message.trim(),
            }),

            ...(payload.isRead !== undefined && {
                isRead: payload.isRead,
            }),
        },
    });

    return updatedNotification;
};




const markNotificationAsRead = async (
    notificationId: string,
    userId: string
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Notification not found."
        );
    }

    const updatedNotification = await prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });

    return updatedNotification;
};




const markAllNotificationsAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });

    return {
        updatedCount: result.count,
    };
};




const deleteNotification = async (
    notificationId: string,
    userId: string
) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Notification not found."
        );
    }

    await prisma.notification.delete({
        where: {
            id: notificationId,
        },
    });

    return null;
};


export const NotificationService = {
    createNotification,
    getMyNotifications,
    getSingleNotification,
    updateNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};