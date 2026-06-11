const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Create ticket
app.post('/api/tickets', (req, res) => {
  try {
    const { customer_name, customer_email, subject, description } = req.body;

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const ticket = createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// Get all tickets
app.get('/api/tickets', (req, res) => {
  try {
    const { status, search } = req.query;
    const tickets = getTickets(status, search);
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// Get single ticket
app.get('/api/tickets/:ticket_id', (req, res) => {
  try {
    const ticket = getTicketById(req.params.ticket_id);

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found'
      });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// Update ticket
app.put('/api/tickets/:ticket_id', (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    const result = updateTicketStatus(
      req.params.ticket_id,
      status,
      notes
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});