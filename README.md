# Freelancer Escrow Platform

A full-stack MERN application for managing freelance projects with secure escrow payments, proposals, and dispute resolution.

## Tech Stack

React, Node.js, Express, MongoDB, JWT

## Features

- User registration & login with JWT authentication
- Role-based access control (Client, Freelancer, Admin)
- Post and browse freelance jobs
- Submit and manage proposals
- Escrow payment management 
- Integrated payment gateway
- Secure payment release system
- Dispute resolution system
- Admin dashboard for platform management
- Real-time project tracking
- Proposal acceptance/rejection workflow


### Backend

```bash
cd server
npm install
# Create .env file with DB_URL, JWT_SECRET, and other configurations
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## API Endpoints

- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (auth required)
- `GET /api/proposals` - Get proposals
- `POST /api/proposals` - Submit proposal (auth required)
- `GET /api/escrow` - Get escrow information
- `POST /api/escrow` - Create escrow (auth required)
- `POST /api/payment` - Process payment (auth required)
- `PUT /api/release` - Release payment (auth required)
- `POST /api/dispute` - Create dispute (auth required)
- `GET /api/dispute` - Get disputes

## Project Structure

```
client/               # React frontend
├── src/
│   ├── Components/
│   │   ├── Admin/
│   │   ├── Auth/
│   │   ├── Client/
│   │   └── Freelancer/
│   ├── Context/
│   ├── Pages/
│   └── Services/

server/               # Node.js backend
├── Controller/
├── Middleware/
├── Model/
└── Routes/
```

## Getting Started

1. Clone the repository
2. Install backend and frontend dependencies
3. Configure environment variables
4. Start both backend and frontend servers
5. Access the application in your browser
