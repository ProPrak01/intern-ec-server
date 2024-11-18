const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Leads = require("../models/leadsModel");
const {
  getLeads,
  createLead,
  updateLead,
} = require("../controllers/leadsController");

// All routes are protected
router.use(protect);

// Test endpoint
router.get('/test-user-leads', protect, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get sample leads with different queries
    const allLeads = await Leads.find({}).limit(1);
    const userLeads = await Leads.find({ 
      $or: [
        { reference: userId },
        { assignedTo: userId },
        { assignedAdmin: userId }
      ]
    });

    // Get a random lead for comparison
    const sampleLead = await Leads.findOne({});

    res.json({
      debug: {
        userId,
        userObjectId: new mongoose.Types.ObjectId(userId),
        sampleLeadReference: sampleLead?.reference,
        sampleLeadAssignedTo: sampleLead?.assignedTo,
      },
      counts: {
        totalLeads: await Leads.countDocuments({}),
        userLeads: userLeads.length,
      },
      sampleData: {
        allLeads,
        userLeads,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Other routes
router.post("/", getLeads);
router.post("/create", createLead);
router.put("/:id", updateLead);

module.exports = router; 