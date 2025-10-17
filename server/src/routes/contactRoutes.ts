import express from "express";
import {protectRoute} from "../middleware/auth.ts";
import {
    createRequest,
    getContacts,
    getRequests,
    removeContact,
    respondRequest
} from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.get('/', protectRoute, getContacts);
contactRouter.get('/requests', protectRoute, getRequests);
contactRouter.post('/request/:targetId', protectRoute, createRequest);
contactRouter.post('/respond', protectRoute, respondRequest);
contactRouter.delete('/:friendId', protectRoute, removeContact);

export default contactRouter;