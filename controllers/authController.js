const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const EmployeeModel = require('../models/Employee');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await EmployeeModel.findOne({ email: email });

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid password" });
            }

            const token = jwt.sign(
                { id: user._id, name: user.name, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.json({ message: "Success", user: { name: user.name, email: user.email } });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    },

    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const hash = await bcrypt.hash(password, 10);
            const employee = await EmployeeModel.create({ name, email, password: hash });
            res.json(employee);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.json({ message: "Logged out successfully" });
    },

    verifyAuth: (req, res) => {
        return res.json({ 
            authenticated: true, 
            user: req.user 
        });
    },

    getHome: (req, res) => {
        return res.json({ 
            message: "Success",
            authenticated: true,
            user: req.user
        });
    }
};

module.exports = authController;