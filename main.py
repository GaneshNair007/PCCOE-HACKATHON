from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI application
app = FastAPI(
    title="Backend API",
    description="FastAPI backend service with health checks and CORS configuration",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing) configuration
# This allows frontend applications (React, Vue, Next.js, etc.) to communicate with this backend.
# In production, replace ["*"] with your frontend domain(s), e.g. ["http://localhost:3000", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allows requests from any origin
    allow_credentials=True,         # Allows cookies/authentication headers
    allow_methods=["*"],            # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all request headers
)


@app.get("/")
def read_root():
    """
    Root endpoint to verify the backend is running.
    """
    return {"message": "Backend is running"}


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring uptime and status.
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    # Allows running the script directly with: python main.py
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
