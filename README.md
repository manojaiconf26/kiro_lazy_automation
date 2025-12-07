# Release Notes Generator

A web application for generating release notes and changelogs from GitHub repositories.

## Project Structure

```
release-notes-generator/
├── frontend/          # React frontend application
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Express backend API
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── package.json       # Root workspace configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your AWS credentials
```

3. Run development servers:

Frontend:
```bash
npm run dev:frontend
```

Backend:
```bash
npm run dev:backend
```

## Testing

Run all tests:
```bash
npm test
```

Run frontend tests:
```bash
npm run test:frontend
```

Run backend tests:
```bash
npm run test:backend
```

## Build

Build both frontend and backend:
```bash
npm run build:frontend
npm run build:backend
```

## Requirements

- Node.js 18+
- npm 9+
- AWS credentials with Bedrock access
