const path = require('path');
module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
    },
  },
};
