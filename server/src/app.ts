import express, {Request, Response} from 'express';
import 'dotenv/config';
import cors from 'cors';

import userRouter from './routes/userRoutes';
import messageRouter from './routes/messageRoutes';
import contactRouter from './routes/contactRoutes';

const app = express();

// Middleware setup
app.use(express.json({limit: '4mb'}));
app.use(cors());

// Routes Setup
app.get('/api/status', (req: Request, res: Response) => res.send('Server is live'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/contacts', contactRouter);

export default app;
