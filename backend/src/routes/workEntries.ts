import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

interface WorkEntry extends RowDataPacket {
  id: number;
  date: string;
  work_type: string;
  volume: number;
  unit: string;
  performer: string;
  created_at: string;
}

// GET /api/work-entries
router.get(
  '/',
  [
    query('from').optional().isDate().withMessage('Invalid from date'),
    query('to').optional().isDate().withMessage('Invalid to date'),
    query('sort').optional().isIn(['asc', 'desc']).withMessage('Sort must be asc or desc'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { from, to, sort = 'desc' } = req.query as {
      from?: string;
      to?: string;
      sort?: string;
    };

    let sql = 'SELECT * FROM work_entries WHERE 1=1';
    const params: string[] = [];

    if (from) {
      sql += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND date <= ?';
      params.push(to);
    }

    sql += ` ORDER BY date ${sort === 'asc' ? 'ASC' : 'DESC'}, created_at DESC`;

    const [rows] = await pool.execute<WorkEntry[]>(sql, params);
    res.json(rows);
  }
);

// POST /api/work-entries
router.post(
  '/',
  [
    body('date')
      .notEmpty().withMessage('Date is required')
      .isDate().withMessage('Invalid date format')
      .custom((val: string) => {
        if (new Date(val) > new Date()) throw new Error('Date cannot be in the future');
        return true;
      }),
    body('workType')
      .notEmpty().withMessage('Work type is required')
      .isLength({ min: 2 }).withMessage('Work type must be at least 2 characters'),
    body('volume')
      .notEmpty().withMessage('Volume is required')
      .isFloat({ gt: 0 }).withMessage('Volume must be greater than 0'),
    body('unit')
      .notEmpty().withMessage('Unit is required'),
    body('performer')
      .notEmpty().withMessage('Performer is required')
      .isLength({ min: 3 }).withMessage('Performer name must be at least 3 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { date, workType, volume, unit, performer } = req.body as {
      date: string;
      workType: string;
      volume: number;
      unit: string;
      performer: string;
    };

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO work_entries (date, work_type, volume, unit, performer) VALUES (?, ?, ?, ?, ?)',
      [date, workType, volume, unit, performer]
    );

    const [rows] = await pool.execute<WorkEntry[]>(
      'SELECT * FROM work_entries WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  }
);

// PUT /api/work-entries/:id
router.put(
  '/:id',
  [
    body('date')
      .notEmpty().withMessage('Date is required')
      .isDate().withMessage('Invalid date format')
      .custom((val: string) => {
        if (new Date(val) > new Date()) throw new Error('Date cannot be in the future');
        return true;
      }),
    body('workType')
      .notEmpty().withMessage('Work type is required')
      .isLength({ min: 2 }).withMessage('Work type must be at least 2 characters'),
    body('volume')
      .notEmpty().withMessage('Volume is required')
      .isFloat({ gt: 0 }).withMessage('Volume must be greater than 0'),
    body('unit')
      .notEmpty().withMessage('Unit is required'),
    body('performer')
      .notEmpty().withMessage('Performer is required')
      .isLength({ min: 3 }).withMessage('Performer name must be at least 3 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { date, workType, volume, unit, performer } = req.body as {
      date: string;
      workType: string;
      volume: number;
      unit: string;
      performer: string;
    };

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE work_entries SET date = ?, work_type = ?, volume = ?, unit = ?, performer = ? WHERE id = ?',
      [date, workType, volume, unit, performer, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const [rows] = await pool.execute<WorkEntry[]>(
      'SELECT * FROM work_entries WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  }
);

// DELETE /api/work-entries/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM work_entries WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  res.status(204).send();
});

export default router;
