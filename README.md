# CiteSearch

CiteSearch is a web application that helps users find PubMed™️ citations to support their writing. It uses AI to analyse user-provided text and search for relevant scientific articles.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Frontend](#setting-up-the-frontend)
  - [Setting Up the Backend](#setting-up-the-backend)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [AWS Deployment](#aws-deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- Search for relevant PubMed™️ citations based on user input
- Generate citations in Open University Harvard Cite Them Right™️ format
- Provide both in-text and reference list citations
- Check relevance of found articles to the user's input
- Responsive web interface

## Technology Stack

- Frontend: React with TypeScript, Vite, Tailwind CSS
- Backend: Python with FastAPI
- Database: NeonDB (PostgreSQL)
- Deployment: Docker, Nginx, AWS CDK, AWS Fargate
- Business Logic: Google Custom Search API, OpenAI API, NCBI API

## Project Structure

```
.
├── cdk/                 # AWS CDK deployment configuration
├── server/              # Backend FastAPI application
├── web/                 # Frontend React application
├── Dockerfile           # Docker configuration for the application
├── nginx.conf           # Nginx configuration
```

## Local Development

### Prerequisites

- Node.js (v14+)
- Python (v3.12+)
- Docker
- AWS CLI (for deployment)

### Setting Up the Frontend

1. Navigate to the `web` directory:
   ```
   cd web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `web` directory with the following content:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The frontend should now be running on `http://localhost:5173`.

### Setting Up the Backend

1. Navigate to the `server` directory:
   ```
   cd server
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `server` directory with the necessary environment variables (see [Environment Variables](#environment-variables) section).

5. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

The backend should now be running on `http://localhost:8000`.

### Running the Application

With both the frontend and backend running, you can access the application at `http://localhost:5173`.

## Deployment

### Docker

To build and run the application using Docker:

1. Build the Docker image:
   ```
   docker build -t citesearch .
   ```

2. Run the container:
   ```
   docker run -p 80:80 citesearch
   ```

The application should now be accessible at `http://localhost`.

### AWS Deployment

The project uses AWS CDK for deployment to AWS Fargate. To deploy:

1. Navigate to the `cdk` directory:
   ```
   cd cdk
   ```

2. Install CDK dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure your AWS credentials:
   ```
   aws configure
   ```

4. Deploy the stack:
   ```
   cdk deploy
   ```

For more detailed deployment instructions, refer to the `cdk/README.md` file.

## Environment Variables

The following environment variables are required for the backend:

- `GOOGLE_CUSTOM_SEARCH_API_KEY`: Google Custom Search API key
- `GOOGLE_CUSTOM_SEARCH_CX`: Google Custom Search engine ID
- `OPENAI_API_KEY`: OpenAI API key
- `NCBI_API_KEY`: NCBI API key
- `DATABASE_URL`: NeonDB connection string

Ensure these are set in the `.env` file for local development or in your deployment environment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).