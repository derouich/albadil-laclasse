
module.exports = {
  apps: [
    {
      name: 'cityparcours-api',
      script: './app.js',
      instances: 0,
      exec_mode: 'cluster',
      watch: true,
      env: {
        NODE_ENV: 'production',
        PORT: '8081'
      }
    }
  ]
};
