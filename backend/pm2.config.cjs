module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/index.ts",
      interpreter: "bun",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL || "app.db",
        HOST: process.env.HOST || "0.0.0.0",
        PORT: process.env.PORT || "3000"
      },
      instances: 1,
      exec_mode: "fork"
    }
  ]
};
