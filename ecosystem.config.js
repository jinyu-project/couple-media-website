// PM2 进程管理配置文件
// 用于生产环境部署和管理 Node.js 应用

module.exports = {
  apps: [
    {
      name: 'couple-media-server',
      script: './src/server.js',
      cwd: './server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // 如果应用崩溃，等待 10 秒后重启
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
}

