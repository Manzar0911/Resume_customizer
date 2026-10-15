module.exports = {
  apps: [
    {
      name: "resume-backend",
      cwd: "/home/ubuntu/resume_customizer/backend",
      script: "/home/ubuntu/resume_customizer/backend/.venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8000 --workers 2",
      interpreter: "none",
      env: {
        PYTHONPATH: "/home/ubuntu/resume_customizer/backend",
      },
      restart_delay: 2000,
      max_restarts: 10,
    },
    {
      name: "resume-frontend",
      cwd: "/home/ubuntu/resume_customizer/frontend",
      script: "npm",
      args: "start -- -p 3000",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      restart_delay: 2000,
      max_restarts: 10,
    },
  ],
};
