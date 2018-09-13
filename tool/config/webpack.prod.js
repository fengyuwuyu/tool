var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helper');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    output: {
        path: helpers.root('./../tool-server/public/'),
        publicPath: './',
        filename: '[name].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    //htmlLoader: {
    //    minimize: false // workaround for ng2
    //},

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
           output: {
                // remove all comments(注释)
                comments: false
            },
            compress: {
                //不显示警告
                warnings: false
            },
            mangle: {
                //mangle 通过设置except数组来防止指定变量被改变 (防止指定变量被混淆)
                except: ['$super', '$', 'exports', 'require']
            }
        }),
        new ExtractTextPlugin('[name].css'),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
});
