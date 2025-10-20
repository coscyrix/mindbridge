import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import NotesController from '../controllers/notes.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const notesController = new NotesController();

router.post('/', authenticate, AsyncWrapper(notesController.postNote));

router.put('/', authenticate, AsyncWrapper(notesController.putNoteById));

router.get('/', authenticate, AsyncWrapper(notesController.getNoteById));

export const notesRouter = { baseUrl: '/api/notes', router };
