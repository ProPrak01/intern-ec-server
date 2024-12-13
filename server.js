import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"; 
import leadsRoutes from "./routes/leadsRoutes.js"; 

// Load environment variables
dotenv.config();

// Debugging MongoDB URI
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Initialize Express
const app = express();
const PORT = parseInt(process.env.PORT || "6000", 10);

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/leads", leadsRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    success: false,
  });
});

// 404 handling middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
