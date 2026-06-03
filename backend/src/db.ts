import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'worklog_user',
  password: process.env.DB_PASSWORD || 'worklog_pass',
  database: process.env.DB_NAME || 'worklog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initializeDatabase(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        work_type VARCHAR(255) NOT NULL,
        volume DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        performer VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Seed work types if empty
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM work_types');
    const count = (rows as Array<{ count: number }>)[0].count;

    if (count === 0) {
      const defaultTypes = [
        'Partition masonry',
        'Formwork installation',
        'Concrete pouring',
        'Rebar tying',
        'Plastering of walls',
        'Excavation',
        'Foundation work',
        'Roofing',
        'Electrical installation',
        'Plumbing installation',
        'Insulation work',
        'Tiling',
        'Painting',
        'Demolition',
        'Site preparation',
      ];

      for (const name of defaultTypes) {
        await connection.execute(
          'INSERT IGNORE INTO work_types (name) VALUES (?)',
          [name]
        );
      }
    }

    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
}

export default pool;
