export interface ICreateNotification {
    title: string;
    message: string;
    userId: string;
}

export interface IUpdateNotification {
    title?: string;
    message?: string;
    isRead?: boolean;
}