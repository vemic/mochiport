import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock reminder storage
const reminders: any[] = [
  {
    id: 'reminder-1',
    title: '企画書のレビュー',
    description: '来週までに企画書の最終レビューを完了する',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/reminders - Get all reminders
router.get('/', (req, res) => {
  console.log('📋 Fetching reminders...');
  
  const { completed, priority, overdue } = req.query;
  let filteredReminders = [...reminders];
  
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    filteredReminders = filteredReminders.filter(reminder => 
      reminder.completed === isCompleted
    );
  }
  
  if (priority) {
    filteredReminders = filteredReminders.filter(reminder =>
      reminder.priority === priority
    );
  }
  
  if (overdue === 'true') {
    const now = new Date();
    filteredReminders = filteredReminders.filter(reminder =>
      new Date(reminder.dueDate) < now && !reminder.completed
    );
  }
  
  res.json({
    reminders: filteredReminders,
    total: filteredReminders.length,
    filters: { completed, priority, overdue }
  });
});

// POST /api/reminders - Create new reminder
router.post('/', (req, res) => {
  console.log('📝 Creating new reminder...');
  
  const { title, description, dueDate, priority = 'medium' } = req.body;
  
  if (!title || !dueDate) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title and dueDate are required'
    });
  }
  
  const reminderId = uuidv4();
  const now = new Date().toISOString();
  
  const newReminder = {
    id: reminderId,
    title,
    description: description || '',
    dueDate,
    completed: false,
    priority,
    createdAt: now,
    updatedAt: now
  };
  
  reminders.unshift(newReminder);
  
  res.status(201).json({
    reminder: newReminder,
    message: 'Reminder created successfully'
  });
});

// GET /api/reminders/:id - Get specific reminder
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Fetching reminder: ${id}`);
  
  const reminder = reminders.find(r => r.id === id);
  
  if (!reminder) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Reminder with id ${id} not found`
    });
  }
  
  res.json({ reminder });
});

// PUT /api/reminders/:id - Update reminder
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, completed, priority } = req.body;
  
  console.log(`📝 Updating reminder: ${id}`);
  
  const reminderIndex = reminders.findIndex(r => r.id === id);
  
  if (reminderIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Reminder with id ${id} not found`
    });
  }
  
  if (title) reminders[reminderIndex].title = title;
  if (description !== undefined) reminders[reminderIndex].description = description;
  if (dueDate) reminders[reminderIndex].dueDate = dueDate;
  if (completed !== undefined) reminders[reminderIndex].completed = completed;
  if (priority) reminders[reminderIndex].priority = priority;
  reminders[reminderIndex].updatedAt = new Date().toISOString();
  
  res.json({
    reminder: reminders[reminderIndex],
    message: 'Reminder updated successfully'
  });
});

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting reminder: ${id}`);
  
  const reminderIndex = reminders.findIndex(r => r.id === id);
  
  if (reminderIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Reminder with id ${id} not found`
    });
  }
  
  reminders.splice(reminderIndex, 1);
  
  res.json({
    message: 'Reminder deleted successfully'
  });
});

export { router as reminderRouter };
