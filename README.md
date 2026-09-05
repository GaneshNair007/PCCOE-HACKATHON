# FastAPI Backend API

A clean, beginner-friendly Python FastAPI backend service with CORS enabled and health check endpoints.

---

## 📁 Project Structure

```text
backend_api/
├── main.py              # FastAPI application & endpoint definitions
├── requirements.txt     # Python dependencies (FastAPI & Uvicorn)
├── .gitignore          # Git ignore rules for Python & virtual environments
└── README.md            # Project setup & run documentation
```

---

## 🚀 Getting Started

Follow these steps to set up and run the server locally.

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.
Check your Python version:
```bash
python3 --version
# or
python --version
```

---

### 2. Navigate to the Project Directory
```bash
cd backend_api
```

---

### 3. Create a Virtual Environment (Recommended)
A virtual environment keeps project dependencies isolated from your global Python installation.

- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  ```
- **Windows:**
  ```bash
  python -m venv venv
  ```

---

### 4. Activate the Virtual Environment

- **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```
- **Windows (Command Prompt):**
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Windows (PowerShell):**
  ```powershell
  venv\Scripts\Activate.ps1
  ```

*(When active, you will see `(venv)` at the beginning of your terminal prompt.)*

---

### 5. Install Dependencies
Install FastAPI and Uvicorn:
```bash
pip install -r requirements.txt
```

---

### 6. Run the Server

You can run the development server using **Uvicorn**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Or directly with Python:
```bash
python main.py
```

- `--reload`: Automatically reloads the server whenever you save code changes.
- The server will start at: **`http://127.0.0.1:8000`** (or `http://localhost:8000`)

---

## 📡 API Endpoints

| Method | Endpoint  | Response                         | Description                    |
|--------|-----------|----------------------------------|--------------------------------|
| `GET`  | `/`       | `{"message": "Backend is running"}` | Basic root status check        |
| `GET`  | `/health` | `{"status": "healthy"}`          | Service health check endpoint  |

### Interactive Documentation
FastAPI automatically generates interactive documentation:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🌐 CORS Configuration

The backend is configured with `CORSMiddleware` in [main.py](file:///Users/lalitamahajan/PCCOE/backend_api/main.py). 

During development, it allows requests from all origins (`allow_origins=["*"]`). For production, replace `["*"]` with your specific frontend domain(s):
```python
origins = [
    "http://localhost:3000",   # React default
    "http://localhost:5173",   # Vite default
]
```

---

## 🐙 Pushing to GitHub

To push this project to GitHub:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add files
git add .

# 3. Commit your changes
git commit -m "Initial commit: FastAPI backend with CORS and health endpoints"

# 4. Link your remote GitHub repository
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 5. Push code
git push -u origin main
```
