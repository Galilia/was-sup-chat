import express from "express";
import {protectRoute} from "../middleware/auth";
import {
    createRequest,
    getContacts,
    getRequests,
    removeContact,
    respondRequest,
    searchUsers
} from "../controllers/contactsController";

const contactRouter = express.Router();

contactRouter.get('/', protectRoute, getContacts);
contactRouter.get('/requests', protectRoute, getRequests);
contactRouter.get('/search', protectRoute, searchUsers);
contactRouter.post('/request/:targetId', protectRoute, createRequest);
contactRouter.post('/respond', protectRoute, respondRequest);
contactRouter.delete('/:friendId', protectRoute, removeContact);

export default contactRouter;