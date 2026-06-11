# Support CRM System

A full-stack customer support ticketing system built with Node.js, Express, SQLite, and vanilla frontend.

## Tech Stack
- Backend: Node.js, Express, better-sqlite3
- Frontend: HTML, Tailwind CSS, Vanilla JS
- Deployment: Railway.app

## Features
- Create tickets with auto-generated ID
- List all tickets with search & filter by status
- View ticket details and notes
- Update status and add notes


## Local Setup
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

## API Endpoints
- `POST /api/tickets`
- `GET /api/tickets?status=&search=`
- `GET /api/tickets/:ticket_id`
- `PUT /api/tickets/:ticket_id`