var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helper');

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root('dist'),
        publicPath: 'http://localhost:8088/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [  
        new ExtractTextPlugin('[name].css')
    ],

    devServer: {
        historyApiFallback: true,
		disableHostCheck: true,
        stats: 'minimal'
    }
});
