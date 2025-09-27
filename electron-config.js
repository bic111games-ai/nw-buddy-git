const config = require('./electron-config.base.json')

module.exports = {
  ...config,
  extraResources: [
    {
      from: "apps/electron/data",
      to: "data"
    }
  ],
  files: [
    ...config.files
  ]
}
