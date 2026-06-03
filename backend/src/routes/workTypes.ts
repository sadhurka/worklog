import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

interface WorkType extends RowDataPacket {
  id: number;
  name: string;
}

// GET /api/work-types
router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.execute<WorkType[]>(
    'SELECT * FROM work_types ORDER BY name ASC'
  );
  res.json(rows);
});

// POST /api/work-types
router.post(
  '/',
  [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name } = req.body as { name: string };

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO work_types (name) VALUES (?)',
        [name]
      );

      const [rows] = await pool.execute<WorkType[]>(
        'SELECT * FROM work_types WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Work type already exists' });
        return;
      }
      throw err;
    }
  }
);

export default router;
