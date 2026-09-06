import { Prisma, Role } from "../../../generated/prisma/client";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequstUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const getMyPayments = async (query: IQuery, user: RequstUser) =>{
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"

     const student = await prisma.student.findUnique({
        where: { userId: user.userId },
    });

    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Student Profile Not Found");
    }

    const andConditions: Prisma.StudentFeeWhereInput[] = [
        {
            studentId: student.id // Directly query the student fees using the student's ID relationship
        }
    ];

     const payments = await prisma.studentFee.findMany({
        where: { AND : andConditions },
        take: limit,
        skip,
        orderBy: { [sortBy] : sortOrder },
        include: {
            student: true
        },
    });

    const total = await prisma.studentFee.count({
        where: { AND: andConditions },
    });
    return {
        data: payments,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };

}

const getAllPayments = async (query: IQuery) =>{
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"

    const andConditions: Prisma.StudentFeeWhereInput[] = []

    if (query.studentEmail || query.email) {
        const targetEmail = query.studentEmail || query.email;
        andConditions.push({
            student: {
                email: targetEmail
            },
        });
    }

     const payments = await prisma.studentFee.findMany({
        where: { AND : andConditions },
        take: limit,
        skip,
        orderBy: { [sortBy] : sortOrder },
        include: {
            student:{
                select:{
                    id: true,
                    name: true,
                    email: true,
                    studentId: true
                }
            }
        },
    });

    const total = await prisma.studentFee.count({
        where: andConditions.length > 0 ? { AND: andConditions } : {},
    });

    return {
        data: payments,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };

}

const getSinglePayment = async (paymentId: string, user: RequstUser) => {
    // 1. Fetch from studentFee table instead of healthcare payment table
    const payment = await prisma.studentFee.findUnique({
        where: { id: paymentId },
        include: {
            student: {
                select: { id: true, name: true, email: true, userId: true, studentId: true },
            },
            program: true,    
            department: true,  
        },
    });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment Record Not Found");
    }

    
    if (user.role === Role.STUDENT) {
        
        if (payment.student.userId !== user.userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You Are Not Allowed To View This Payment Record",
            );
        }
    }

    return payment;
};

export const PaymentServices = {
    getMyPayments,
    getAllPayments,
    getSinglePayment
}