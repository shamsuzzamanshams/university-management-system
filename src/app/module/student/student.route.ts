import express from "express";
// import { Role } from "@prisma/client";
import { auth } from "../../middleware/checkAuth"; // Your custom authentication guard middleware
import { StudentController } from "./student.controller";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
// import { upload } from "../../utils/fileUpload"; // Replace with your actual multer/cloudinary upload configuration file path

const router = express.Router();

/**
 * Route:  GET /api/v1/students/my-profile
 * Desc:   Retrieve active profile metadata metrics for the logged-in student
 * Access: Restricted strictly to logged-in Students
 */
router.get(
  "/my-profile",
  auth(Role.STUDENT),
  StudentController.getMyProfile
);

/**
 * Route:  PATCH /api/v1/students/update-profile
 * Desc:   Modify structural fields, departments, and upload single/multiple media records via form-data
 * Access: Restricted strictly to logged-in Students
 */
router.patch(
  "/update-profile",
  auth(Role.STUDENT),
  // Intercept inbound form-data payloads to process file buffers into Cloudinary URL paths safely
  upload.fields([
    { name: "profileImage", maxCount: 1 },         // Expects a single user display photo string
    { name: "academicDocuments", maxCount: 10 }    // Allows multi-file tracking matrices (e.g. certificates)
  ]),
  StudentController.updateMyProfile
);

export const StudentRoutes = router;
