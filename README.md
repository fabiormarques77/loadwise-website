# LoadWise Website

Production-ready Next.js website for LoadWise, the AI-powered operating system for independent freight.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- SMTP credentials for operator application delivery

## Local setup

```bash
cp .env.example .env.local
npm install
npm run build
npm start
```

The production server listens on port 3000 by default.

## Environment variables

Copy `.env.example` and configure the public site URL, destination email and SMTP provider. Submitted documents are validated and delivered as protected email attachments; no documents are stored on the web server.

## EasyPanel / DigitalOcean

Create an application from this repository and deploy with the included `Dockerfile`. Add every variable from `.env.example` in the EasyPanel environment settings, map the application to port 3000 and attach the production domain.

## Quality commands

```bash
npm run typecheck
npm run build
```
