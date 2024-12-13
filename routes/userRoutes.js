import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  activateUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (example)
router.get("/profile", protect, (req, res) => {
  res.json({
    user: req.user,
    success: true,
  });
});
router.patch("/activate/:id", protect, authorize("SuperAdmin"), activateUser);

export default router;
