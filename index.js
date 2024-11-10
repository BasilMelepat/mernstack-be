const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const EmployeeModel = require('./models/Employee.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://mernstack-fe-green.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser())

mongoose.connect("mongodb+srv://basilmelepat:bas123@mernstack.gm03i.mongodb.net/mernstack?retryWrites=true&w=majority&appName=mernstack");

const verifyUser = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided", authenticated: false });
        }
        
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token", authenticated: false });
            }
            req.userId = decoded._id; // Only storing user ID instead of entire decoded token
            next();
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", authenticated: false });
    }
}

app.get('/verify', verifyUser, (req, res) => {
    return res.json({ 
        authenticated: true, 
        user: req.user 
    });
});

app.get('/home', verifyUser, (req, res) => {
    return res.json({ 
        message: "Success",
        authenticated: true,
        user: req.user
    });
});

app.post("/login", async (req, res) => {
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
            { id: user._id, name: user.name, email: user.email },"jwt-secret-key",{ expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({ message: "Success", user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const employee = await EmployeeModel.create({ name, email, password: hash });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

app.listen(3001, () => {
    console.log("server is running")
});
