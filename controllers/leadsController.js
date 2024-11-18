const Leads = require("../models/leadsModel");
const { SUPER_ADMIN, ADMIN, COUNSELLOR, PARTNER } = require("../constants/userRoles");

// Get leads based on role and filters
const getLeads = async (req, res) => {
  try {
    const {
      searchTerm,
      statusArray,
      priorityArray,
      limit = 10,
      page = 1,
      from,
      to,
      unassigned = true,
    } = req.body;

    const { role, userId } = req.user;
    
    console.log('Current User:', { role, userId });

    // First, let's check if this user has any leads at all
    const userLeadsCount = await Leads.countDocuments({
      $or: [
        { reference: userId },
        { assignedTo: userId },
        { assignedAdmin: userId },
        { assignedBy: userId }
      ]
    });

    console.log('User total leads (any role):', userLeadsCount);

    // Build the query based on role
    const query = {};

    // For testing, let's be more permissive with the query
    if (role === PARTNER) {
      query.$or = [
        { reference: userId },
        { assignedTo: userId }
      ];
    } else if (role === COUNSELLOR) {
      query.$or = [
        { assignedTo: userId },
        { reference: userId }
      ];
    } else if (role === ADMIN) {
      query.$or = [
        { assignedAdmin: userId },
        { assignedTo: userId },
        { reference: userId }
      ];
    } else if (role === SUPER_ADMIN) {
      // Super admin can see all leads
    } else {
      return res.status(403).json({
        message: "Access denied. Invalid role.",
        success: false
      });
    }

    // Add search filters if provided
    if (searchTerm) {
      const searchQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phoneNumber: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      query.$and = [query.$or, searchQuery.$or];
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalLeadsAccessible = await Leads.countDocuments(query);
    console.log('Accessible leads count:', totalLeadsAccessible);

    // Fetch leads
    const leads = await Leads.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email')
      .populate('assignedAdmin', 'name email')
      .populate('assignedBy', 'name email')
      .populate('reference', 'name email')
      .lean()
      .exec();

    // Sample the first lead for debugging
    if (leads.length > 0) {
      console.log('Sample lead:', {
        id: leads[0]._id,
        reference: leads[0].reference,
        assignedTo: leads[0].assignedTo
      });
    }

    res.json({
      message: "Leads fetched successfully",
      success: true,
      leads,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalLeadsAccessible,
      },
      debug: {
        userRole: role,
        userId: userId,
        appliedQuery: query,
        totalLeadsInDB: await Leads.countDocuments({}),
        userTotalLeads: userLeadsCount,
        status: req.user.status
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ 
      message: "Failed to fetch leads", 
      success: false,
      error: error.message 
    });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const newLead = new Leads({
      ...req.body,
      reference: req.user.userId, // Set reference to current user
    });
    const savedLead = await newLead.save();
    res.status(201).json({
      message: "Lead created successfully",
      success: true,
      lead: savedLead,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create lead", success: false });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const updatedLead = await Leads.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found", success: false });
    }
    res.json({
      message: "Lead updated successfully",
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead", success: false });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLead,
}; 