var webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: './bin',
        filename: 'index.bundle.js'
    },
    module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader'
         }]
     },
     plugins: [
       new webpack.EnvironmentPlugin([
         'PORT'
       ])
     ]
};
