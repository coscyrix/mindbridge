import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const NotesController = require('../controllers/notes.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const notesController = new NotesController();

router.post('/', authenticate, AsyncWrapper(notesController.postNote));

router.put('/', authenticate, AsyncWrapper(notesController.putNoteById));

router.get('/', authenticate, AsyncWrapper(notesController.getNoteById));

export const notesRouter = { baseUrl: '/api/notes', router };
