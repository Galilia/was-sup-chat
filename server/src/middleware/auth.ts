import User from "../models/User.ts";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) return res.json({success: false, error: "No token provided"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password").lean();

        if (!user) return res.json({success: false, error: "User not found"});

        req.user = user;
        next();
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}