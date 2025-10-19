import jwt from 'jsonwebtoken';
import {Response} from "express";

// Function to generate a JWT token
export const generateToken = (userId: string | number) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");
    return jwt.sign({userId}, secret);
}

export function handleErrorResponse(res: Response, error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.json({success: false, message});
}
