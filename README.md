# FloWork

An AI-powered workflow automation platform built with Flask, Next.js, LangGraph, and Groq LLM integration.

## Architecture

FloWork consists of three components:

- **Flask API Backend** - RESTful API for workflow management and execution
- **Next.js Frontend** - Modern web interface with glassmorphic design
- **Streamlit UI** (Legacy) - Original prototype interface

## Features

- Visual workflow builder with intuitive node-based interface
- AI-powered nodes leveraging Groq LLMs for intelligent task processing
- Conditional routing with dynamic workflow paths based on AI decisions
- Interactive workflow visualization
- Workflow persistence with file-based storage
- Pre-built templates for common use cases
- RESTful API for programmatic workflow management
- Real-time workflow execution monitoring

## Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key

## Installation

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Add your GROQ_API_KEY to .env
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start Flask API (Port 5000)

```bash
cd backend
python app.py
```

### Start Next.js Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

### Start Streamlit UI (Port 8501) - Optional

```bash
streamlit run src/main.py
```

## API Endpoints

### Workflows

- `GET /api/workflows` - List all workflows
- `GET /api/workflows/<id>` - Get workflow details
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/<id>` - Update workflow
- `DELETE /api/workflows/<id>` - Delete workflow
- `POST /api/workflows/<id>/execute` - Execute workflow

### Health Check

- `GET /api/health` - API health status

## Project Structure

```
flowork/
├── backend/              # Flask API server
│   ├── app.py           # Main API application
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js web application
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   └── lib/            # Utility functions
├── src/                # Core workflow engine
│   ├── core/          # Execution engine
│   ├── models/        # Data models
│   ├── nodes/         # Node implementations
│   ├── storage/       # Persistence layer
│   └── ui/            # Streamlit interface
├── config/            # Configuration management
├── templates/         # Workflow templates
└── tests/             # Test suite
```

## Configuration

Environment variables are managed through `.env` file:

### Required Variables

- `GROQ_API_KEY` - Your Groq API key

### Optional Variables

- `LLM_MODEL_NAME` - Groq model name (default: `llama-3.3-70b-versatile`)
- `LLM_TEMPERATURE` - Model temperature (default: `0.2`)
- `WORKFLOW_STORAGE_PATH` - Storage directory (default: `./workflows`)
- `LOG_LEVEL` - Logging level (default: `INFO`)
- `LOG_FILE` - Log file path (default: `./logs/workflow_builder.log`)

## Usage

### Creating a Workflow

1. Access the Next.js UI at `http://localhost:3000`
2. Click "Create New" to start a new workflow
3. Add nodes with names and prompts
4. Configure routing rules between nodes
5. Save the workflow

### Executing a Workflow

1. Navigate to the "Execute" tab
2. Select a workflow from the dropdown
3. Provide input text
4. Click "Execute" to run the workflow
5. View results and execution logs

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

Follow PEP 8 for Python code and use ESLint/Prettier for TypeScript/React code.

## License

MIT License

## Support

For issues and questions, please open an issue on the project repository.
