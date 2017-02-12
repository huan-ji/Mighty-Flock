var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: './bin',
        filename: 'index.bundle.js'
    },
    module: {
         loaders: [{
             test: /\.js$/,
             loader: 'babel-loader'
         }]
     },
     resolve: {
        modules: [path.resolve(__dirname, '../'), 'node_modules/'],
        descriptionFiles: ['package.json'],
        extensions: ['.webpack.js', '.web.js', '.js']
    }
};
