require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const leadsRoutes = require("./routes/leadsRoutes");

// Add this line to debug
console.log('MongoDB URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 6000;

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/leads", leadsRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    success: false
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    success: false
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
