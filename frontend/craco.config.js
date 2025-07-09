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
      
      // FIX: Exclude framer-motion from webpack minification to prevent Fr.initialize error
      webpackConfig.optimization = webpackConfig.optimization || {};
      webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer || [];
      
      // Configure terser to exclude framer-motion from mangling
      const TerserPlugin = require('terser-webpack-plugin');
      webpackConfig.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            mangle: {
              // Exclude framer-motion from variable name mangling
              reserved: ['framer-motion'],
              // Don't mangle classes/functions from framer-motion
              keep_classnames: /framer-motion/,
              keep_fnames: /framer-motion/,
            },
            compress: {
              // Don't compress framer-motion imports
              keep_fnames: true,
              keep_classnames: true,
            },
          },
        })
      );
      
      return webpackConfig;
    },
  },
};
  
