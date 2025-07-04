// Load configuration from environment or config file
const path = require('path');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      }
      
      // Fix source map warnings for @reown packages
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/@reown/,
          message: /Failed to parse source map/,
        },
        {
          module: /node_modules\/@safe-global/,
          message: /Failed to parse source map/,
        },
        // Generic source map warning suppression for node_modules
        /Failed to parse source map.*node_modules/,
      ];
      
      return webpackConfig;
    },
  },
};
  
