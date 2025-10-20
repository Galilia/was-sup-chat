import User from "../models/User";

import bcrypt from "bcryptjs";
import {generateToken, handleErrorResponse} from "../lib/utils";
import cloudinary from "../lib/cloudinary";
import {Response} from "express";
import {AuthRequest} from "../lib/types";

// Signup a new user
export const signup = async (req: AuthRequest, res: Response) => {
    const {fullName, email, password, gender, bio} = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.json({success: false, error: "Missing Details"});
        }
        const user = await User.findOne({email});

        if (user) {
            return res.json({success: false, error: "Account already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, email, password: hashedPassword, gender, bio
        })

        const savedUser = await newUser.save();
        const {password: _, ...userData} = savedUser.toObject();

        const token = generateToken(String(newUser._id));

        res.json({success: true, userData, token, message: "Account created successfully"})
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Controller for user login
export const login = async (req: AuthRequest, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if (!user) return res.json({success: false, error: "User not found"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) return res.json({success: false, error: "Invalid Credentials"});

        const token = generateToken(String(user._id));
        const {password: pwd, ...userData} = user.toObject();

        res.json({success: true, userData, token, message: "Login Successful"})
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Controller to check if user is authenticated
export const checkAuth = async (req: AuthRequest, res: Response) => {
    try {
        res.json({success: true, user: req.user});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Controller to update user profile details
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const {fullName, gender, bio, profilePic} = req.body;

        const userId = req.user?._id;
        let updatedUser;

        if (!profilePic) {
            User.findByIdAndUpdate(userId, {fullName, gender, bio}, {new: true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                fullName,
                gender,
                bio
            }, {new: true});
        }

        res.json({success: true, user: updatedUser});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}
