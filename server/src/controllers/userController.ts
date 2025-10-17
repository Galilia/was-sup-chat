import User from "../models/User.ts";

import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.ts";
import cloudinary from "../lib/cloudinary.ts";

// Signup a new user
export const signup = async (req, res) => {
    const {fullName, email, password, bio} = req.body;

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
            fullName, email, password: hashedPassword, bio
        })

        const savedUser = await newUser.save();
        const {password: _, ...userData} = savedUser.toObject();

        const token = generateToken(newUser._id);

        res.json({success: true, userData, token, message: "Account created successfully"})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}

// Controller for user login
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if (!user) return res.json({success: false, error: "User not found"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) return res.json({success: false, error: "Invalid Credentials"});

        const token = generateToken(user._id);
        const {password: pwd, ...userData} = user.toObject();

        res.json({success: true, userData, token, message: "Login Successful"})
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}

// Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    try {
        const userData = req.user.toObject ? req.user.toObject() : req.user;
        res.json({success: true, user: userData});
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message});
    }
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {fullName, bio, profilePic} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            User.findByIdAndUpdate(userId, {fullName, bio}, {new: true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                fullName,
                bio
            }, {new: true});
        }

        res.json({success: true, user: updatedUser});
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
}
