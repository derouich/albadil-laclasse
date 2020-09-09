
module.exports = {
  apps: [
    {
      name: 'albadil-helpdesk',
      script: './app.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: '8083'
      }
    }
  ]
};
