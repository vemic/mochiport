import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import { conversationRouter } from './routes/conversation.js';
import { draftRouter } from './routes/draft.js';
import { reminderRouter } from './routes/reminder.js';

const app = express();
const PORT = process.env.PORT || 7071;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'mochiport backend server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/drafts', draftRouter);
app.use('/api/reminders', reminderRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/conversations',
      'GET /api/conversations',
      'GET /api/conversations/:id',
      'PUT /api/conversations/:id',
      'DELETE /api/conversations/:id',
      'POST /api/chat/stream',
      'GET /api/drafts',
      'POST /api/drafts',
      'PUT /api/drafts/:id',
      'DELETE /api/drafts/:id',
      'GET /api/reminders',
      'POST /api/reminders',
      'PUT /api/reminders/:id',
      'DELETE /api/reminders/:id'
    ]
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 mochiport backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📝 Conversations API: http://localhost:${PORT}/api/conversations`);
});

export default app;
