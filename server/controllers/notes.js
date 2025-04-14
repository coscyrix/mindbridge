import NotesService from '../services/notes.js';
import dotenv from 'dotenv';

dotenv.config();

export default class NotesController {
  //////////////////////////////////////////
  async postNote(req, res) {
    const data = req.body;

    if (!data.message || !data.session_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const notes = new NotesService();
    const rec = await notes.postNote(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putNoteById(req, res) {
    const query = req.query;
    const data = req.body;
    data.note_id = query.note_id;

    if (!data.note_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const notes = new NotesService();
    const rec = await notes.putNoteById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getNoteById(req, res) {
    const data = req.query;

    const notes = new NotesService();
    const rec = await notes.getNoteById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
