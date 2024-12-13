import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      console.log("Auth Middleware - Found User:", {
        id: user._id,
        role: user.role,
        status: user.status,
        token: token.slice(-10),
      });

      if (!user) {
        return res.status(401).json({
          message: "User not found",
          success: false,
        });
      }

      req.user = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        status: user.status,
      };

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(401).json({
        message: "Not authorized, token failed",
        success: false,
        error: error.message,
      });
    }
  } else {
    res.status(401).json({
      message: "Not authorized, no token",
      success: false,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this route`,
        success: false,
      });
    }
    next();
  };
};
