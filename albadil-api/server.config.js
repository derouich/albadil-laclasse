
module.exports = {
  apps: [
    {
      name: 'albadil-api',
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
