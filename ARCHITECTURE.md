# Flowork Architecture

## Overview

Flowork now features a modern full-stack architecture with a Flask backend API and Next.js frontend.

## Architecture Components

### Backend - Flask API (Port 5000)

**Location:** `backend/`

A RESTful API built with Flask that manages workflows and executes them using LangGraph.

**Endpoints:**

- `GET /api/health` - Health check
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/<id>` - Get specific workflow
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/<id>` - Update workflow
- `DELETE /api/workflows/<id>` - Delete workflow
- `POST /api/workflows/<id>/execute` - Execute workflow with input
- `POST /api/workflows/<id>/validate` - Validate workflow structure

**To run:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend - Next.js UI (Port 3000)

**Location:** `frontend/`

A modern React-based UI built with Next.js 14, TypeScript, and Tailwind CSS.

**Features:**

- Workflow List - View, edit, delete workflows
- Workflow Builder - Create and modify workflows with nodes
- Workflow Executor - Run workflows with custom input and view results

**To run:**
```bash
cd frontend
npm install
npm run dev
```

### Core Engine

**Location:** `src/`

The core workflow engine using LangGraph, LangChain, and Groq LLM.

**Components:**

- `models/` - Pydantic models for Workflow, Node, State
- `core/` - Graph builder, executor, router, LLM manager
- `nodes/` - Node implementations and factory
- `storage/` - File-based workflow storage
- `utils/` - Logging, validation, helpers

## Data Flow

1. **User creates workflow** → Frontend sends to `/api/workflows`
2. **Backend saves** → FileStorage writes to `workflows/` directory
3. **User executes** → Frontend sends input to `/api/workflows/<id>/execute`
4. **Backend compiles** → GraphBuilder creates LangGraph
5. **Execution** → WorkflowExecutor runs nodes with LLM
6. **Results returned** → Frontend displays output and logs

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
LLM_MODEL_NAME=qwen/qwen3-32b
LLM_TEMPERATURE=0.2
LOG_LEVEL=INFO
```

## Running the Full Stack

### Terminal 1 - Backend
```bash
cd backend
python app.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Original Streamlit (still available): http://localhost:8501

## Technology Stack

**Backend:**
- Flask 3.0
- Flask-CORS
- LangGraph
- LangChain-Groq
- Pydantic

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

**AI/ML:**
- Groq LLM (Qwen 32B)
- LangGraph for workflow orchestration
- LangChain for AI components
