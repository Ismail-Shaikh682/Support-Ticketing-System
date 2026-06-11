
const Database = require('better-sqlite3');
const path = require('path');

// Create/open SQLite file (will be saved in project root)
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'tickets.db');
const db = new Database(dbPath);


db.pragma('journal_mode = WAL');


db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK(status IN ('Open','In Progress','Closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
  );
`);


function generateTicketId() {
  const last = db.prepare('SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1').get();
  if (!last) return 'TKT-001';
  const num = parseInt(last.ticket_id.split('-')[1]) + 1;
  return 'TKT-' + String(num).padStart(3, '0');
}

module.exports = {
  db,
  generateTicketId,
  createTicket: (data) => {
    const ticket_id = generateTicketId();
    const stmt = db.prepare(`
      INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(ticket_id, data.customer_name, data.customer_email, data.subject, data.description);
    return { ticket_id, created_at: new Date().toISOString() };
  },
  getTickets: (status, search) => {
    let query = 'SELECT ticket_id, customer_name, subject, status, created_at FROM tickets WHERE 1=1';
    const params = [];
    if (status && ['Open','In Progress','Closed'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR ticket_id LIKE ? OR customer_email LIKE ? OR subject LIKE ? OR description LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }
    query += ' ORDER BY created_at DESC';
    return db.prepare(query).all(...params);
  },
  getTicketById: (ticket_id) => {
    const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(ticket_id);
    if (!ticket) return null;
    const notes = db.prepare('SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC').all(ticket_id);
    return { ...ticket, notes };
  },
  updateTicketStatus: (ticket_id, status, note_text) => {
    const stmt = db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?');
    stmt.run(status, ticket_id);
    if (note_text && note_text.trim()) {
      db.prepare('INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)').run(ticket_id, note_text.trim());
    }
    return { success: true, updated_at: new Date().toISOString() };
  }
};
