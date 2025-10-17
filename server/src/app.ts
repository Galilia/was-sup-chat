import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import userRouter from './routes/userRoutes.ts';
import messageRouter from './routes/messageRoutes.ts';
import contactRouter from './routes/contactRoutes.ts';

const app = express();

// Middleware setup
app.use(express.json({limit: '4mb'}));
app.use(cors());

// Routes Setup
app.get('/api/status', (req, res) => res.send('Server is live'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/contacts', contactRouter);

export default app;
