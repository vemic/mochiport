import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock draft storage
const drafts: any[] = [
  {
    id: 'draft-1',
    title: 'プロジェクト企画書のドラフト',
    content: '新しいAIチャットアプリケーションの企画について...',
    tags: ['企画', 'AI', 'アプリ'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/drafts - Get all drafts
router.get('/', (req, res) => {
  console.log('📋 Fetching drafts...');
  
  const { tag, search } = req.query;
  let filteredDrafts = [...drafts];
  
  if (tag) {
    filteredDrafts = filteredDrafts.filter(draft => 
      draft.tags.includes(tag)
    );
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredDrafts = filteredDrafts.filter(draft =>
      draft.title.toLowerCase().includes(searchTerm) ||
      draft.content.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json({
    drafts: filteredDrafts,
    total: filteredDrafts.length,
    filters: { tag, search }
  });
});

// POST /api/drafts - Create new draft
router.post('/', (req, res) => {
  console.log('📝 Creating new draft...');
  
  const { title, content, tags = [] } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Title and content are required'
    });
  }
  
  const draftId = uuidv4();
  const now = new Date().toISOString();
  
  const newDraft = {
    id: draftId,
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: now,
    updatedAt: now
  };
  
  drafts.unshift(newDraft);
  
  res.status(201).json({
    draft: newDraft,
    message: 'Draft created successfully'
  });
});

// GET /api/drafts/:id - Get specific draft
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Fetching draft: ${id}`);
  
  const draft = drafts.find(d => d.id === id);
  
  if (!draft) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Draft with id ${id} not found`
    });
  }
  
  res.json({ draft });
});

// PUT /api/drafts/:id - Update draft
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  
  console.log(`📝 Updating draft: ${id}`);
  
  const draftIndex = drafts.findIndex(d => d.id === id);
  
  if (draftIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Draft with id ${id} not found`
    });
  }
  
  if (title) drafts[draftIndex].title = title;
  if (content) drafts[draftIndex].content = content;
  if (tags) drafts[draftIndex].tags = Array.isArray(tags) ? tags : [];
  drafts[draftIndex].updatedAt = new Date().toISOString();
  
  res.json({
    draft: drafts[draftIndex],
    message: 'Draft updated successfully'
  });
});

// DELETE /api/drafts/:id - Delete draft
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting draft: ${id}`);
  
  const draftIndex = drafts.findIndex(d => d.id === id);
  
  if (draftIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Draft with id ${id} not found`
    });
  }
  
  drafts.splice(draftIndex, 1);
  
  res.json({
    message: 'Draft deleted successfully'
  });
});

export { router as draftRouter };
