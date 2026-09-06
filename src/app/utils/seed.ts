import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where : {
                role : Role.SUPER_ADMIN
            }
        });

        if(isSuperAdminExist){
            console.log("Super Admin Already Exists!");
            return;
        }

        const name = config.super_admin_name
        const email = config.super_admin_email
        const password = config.super_admin_password

        if(!name || !email || !password){
            throw new Error("Super Admin Name , Email, Password Missing In Env File!!!")
        }

        const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

        const superAdmin = await prisma.user.create({
            data : {
                name,
                email,
                password : hashedPassword,
                role : Role.SUPER_ADMIN,
                // needPasswordChange : false,
                emailVerified : true
            }
        })

        console.log("Super Admin Created : ", superAdmin);



    } catch (error) {

        console.log("Error Seeding Super Admin : ", error);

        await prisma.user.delete({
            where : {
                email : config.super_admin_email
            }
        })

        
    }
}

//create tester admin 

export const seedFinanceAdmin = async () => {
    try {
        const isFinanceAdminExist = await prisma.user.findUnique({
            where: {
                email : config.tester_finance_admin_email
            }
        });

        if (isFinanceAdminExist) {
            console.log("Finance Admin Already Exists!");
            return;
        }

        const name = config.tester_finance_admin_name
        const email = config.tester_finance_admin_email
        const password = config.tester_finance_admin_password

        if (!name || !email || !password) {
            throw new Error("Finance Admin Name , Email, Password Missing In Env File!!!")
        }

        const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

        const financeAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.FINANCE_ADMIN,
                // needPasswordChange: false,
                emailVerified: true
            }
        })

        console.log("Fenance Admin Created : ", financeAdmin);



    } catch (error) {

        console.log("Error Seeding Finance Admin : ", error);

        await prisma.user.delete({
            where: {
                email: config.tester_finance_admin_email
            }
        })


    }
}


// create tester doctor

export const seedTesterStudent = async () => {
    try {
        const isTesterStudentExist = await prisma.user.findUnique({
            where: {
                email : config.tester_student_email
            }
        });

        if (isTesterStudentExist) {
            console.log("Tester Student Already Exists!");
            return;
        }

        const name = config.tester_student_name
        const email = config.tester_student_email
        const password = config.tester_student_password

        if (!name || !email || !password) {
            throw new Error("Tester Student Name , Email, Password Missing In Env File!!!")
        }

        const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

        const testerStudent = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.STUDENT,
                // needPasswordChange: false,
                emailVerified: true
            }
        })

        console.log("Tester Student Created : ",testerStudent);



    } catch (error) {

        console.log("Error Seeding Tester Student : ", error);

        await prisma.user.delete({
            where: {
                email: config.tester_student_email
            }
        })


    }
}