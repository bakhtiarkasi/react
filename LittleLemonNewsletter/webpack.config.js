const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Fix for "process is not defined" error
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  );
  
  return config;
};