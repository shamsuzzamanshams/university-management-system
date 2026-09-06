import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	node_env: process.env.NODE_ENV,
	port: process.env.PORT,
	database_url: process.env.DATABASE_URL,
	bak_url: process.env.APP_URL,
	frontend_url: process.env.FRONTEND_URL,
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
	google_clint_id: process.env.GOOGLE_CLINT_ID,
	super_admin_name : process.env.SUPER_ADMIN_NAME!,
	super_admin_email : process.env.SUPER_ADMIN_EMAIL!,
	super_admin_password : process.env.SUPER_ADMIN_PASSWORD!,
	tester_finance_admin_name : process.env.TESTER_FINANCE_ADMIN_NAME!,
	tester_finance_admin_email : process.env.TESTER_FINANCE_ADMIN_EMAIL!,
	tester_finance_admin_password : process.env.TESTER_FINANCE_ADMIN_PASSWORD!,
	tester_student_name : process.env.TESTER_STUDENT_NAME!,
	tester_student_email: process.env.TESTER_STUDENT_EMAIL!,
	tester_student_password: process.env.TESTER_STUDENT_PASSWORD!,
	redis_user: process.env.REDIS_USER!,
	redis_password: process.env.REDIS_PASSWORD!,
	redis_host: process.env.REDIS_HOST!,
	redis_port: process.env.REDIS_PORT!,
	smtp_user: process.env.SMTP_USER!,
	smtp_password: process.env.SMTP_PASSWORD!,
	email_sender: process.env.EMAIL_SENDER!,
	bkash_base_url: process.env.BKASH_BASE_URL!,
	bkash_username: process.env.BKASH_USERNAME!,
	bkash_password: process.env.BKASH_PASSWORD!,
	bkash_app_key: process.env.BKASH_APP_KEY!,
	bkash_secret_key: process.env.BKASH_SECRET_KEY!,
	bkash_callback_url: process.env.BKASH_CALLBACK_URL!
};
