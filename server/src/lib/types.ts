import {Request} from "express";
import {AuthUser} from "../models/User";

export interface AuthRequest extends Request {
    user?: AuthUser;
}