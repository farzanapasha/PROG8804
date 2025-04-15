# Todo Application

A modern todo application built with React frontend and Node.js backend, featuring a clean Material-UI interface and REST API integration.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker (for containerization)

## Project Structure

```
project/
├── frontend/           # React TypeScript frontend
├── backend/           # Node.js backend
└── .github/           # GitHub Actions workflows
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=3004
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

The backend will be available at `http://localhost:3004`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL="http://localhost:3004"
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```
5. Build the frontend development server:
   ```bash
   npm run build
   ```
The application will open automatically in your default browser at `http://localhost:3000`.

## Testing

### Backend Testing

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the tests:
   ```bash
   npm test
   ```

### Frontend Testing

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the tests:
   ```bash
   npm test
   ```

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Modern, responsive Material-UI interface
- RESTful API backend
- TypeScript support
- Docker containerization
- GitHub Actions CI/CD pipeline

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Change a todo's status
- `DELETE /api/todos/:id` - Delete a todo

## Docker Support

Build the images:

```bash
# Backend
cd backend
docker build -t todo-backend .

# Frontend
cd frontend
docker build -t todo-frontend .
```

Run the containers:

```bash
# Backend
docker run -p 3004:3004 todo-backend

# Frontend
docker run -p 3000:3000 todo-frontend
```

## Deployment

The application uses GitHub Actions for CI/CD and can be deployed to Google Cloud Run. The workflow files are located in `.github/workflows/`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.