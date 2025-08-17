// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'robot-log-analysis',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'development',
        TEN_BIEN: 'variable'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
