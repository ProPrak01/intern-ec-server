const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'Partner' } = req.body;
        
        // Check if user exists by email or phone
        const userExists = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (userExists) {
            return res.status(400).json({ 
                message: userExists.email === email 
                    ? 'Email already registered' 
                    : 'Phone number already registered' 
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
            status: 'inactive',
            lastActive: new Date()
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Update lastActive timestamp
            user.lastActive = new Date();
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser }; 