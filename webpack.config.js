module.exports = {
    entry: './server.js',
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
     }
};
