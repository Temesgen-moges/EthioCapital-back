import express from "express";
import {
  createVerification,
  getVerifications,
  submitVerification,
  getVerificationStatus,
  getVerificationById,
  approveVerification,
  rejectVerification,
  deleteVerification,
} from "../controllers/verification/verification.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/Authorize.js";
import { uploadFiles } from "../middleware/multerConfig.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/verification",
  uploadFiles.fields([
    { name: "idPicture", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("POST /api/v1/verification hit");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    next();
  },
  createVerification
);
router.put("/verification/:id/submit", submitVerification);
router.get("/verification/status/:userId/:ideaId", getVerificationStatus);
router.delete("/verification/:id", deleteVerification);

router.get("/verification", authorize("admin"), (req, res, next) => {
  console.log("Admin requested verifications");
  next();
}, getVerifications);
router.get("/verification/:id", authorize("admin"), getVerificationById);
router.put("/verification/:id/approve", authorize("admin"), approveVerification);
router.put("/verification/:id/reject", authorize("admin"), rejectVerification);

export default router;