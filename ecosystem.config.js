const path = require("path");

// Absolute path to the project root (where this file lives)
const PROJECT_ROOT = __dirname;

module.exports = {
  apps: [
    {
      name: "arash-website",
      script: ".next/standalone/server.js",
      interpreter: "bun",
      cwd: PROJECT_ROOT,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        UPLOAD_DIR: path.join(PROJECT_ROOT, "public", "uploads"),
      },
      // Restart policy
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};
