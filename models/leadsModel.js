const mongoose = require("mongoose");

const LeadsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    course: { type: String },
    city: { type: String },
    platform: { type: String, required: true, default: "other" },
    budget: { type: String },
    entranceExamScore: { type: String },
    queries: { type: String },
    previousAcademicPercentage: { type: String },
    preferredCollegeNames: { type: Array },
    status: {
      type: String,
      enum: ["pending", "canceled", "ongoing", "success"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reference: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leads", LeadsSchema); 