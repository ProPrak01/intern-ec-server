const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  activateUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

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

module.exports = router;
