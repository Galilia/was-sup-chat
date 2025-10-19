import {NextFunction, Response} from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import {handleErrorResponse} from "../lib/utils";
import {AuthRequest} from "../lib/types";

// Middleware to protect routes
export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = typeof req.headers.token === "string" ? req.headers.token : undefined;
        if (!token) return res.json({success: false, error: "No token provided"});

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET not defined");

        const decoded = jwt.verify(token, secret) as { userId: string };
        const user = await User.findById(decoded.userId).select("-password").lean();

        if (!user) return res.json({success: false, error: "User not found"});

        req.user = {
            ...user,
            _id: user?._id.toString(),
        };
        next();
    } catch (error) {
        handleErrorResponse(res, error);
    }
}