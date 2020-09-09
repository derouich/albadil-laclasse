
module.exports = {
  apps: [
    {
      name: 'cityparcours-helpdesk',
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
