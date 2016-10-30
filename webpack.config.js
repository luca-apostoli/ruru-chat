var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebPackPlugin = require("copy-webpack-plugin");
var path = require('path');

var env = process.env.MIX_ENV || 'dev'
var prod = env === 'prod'

var plugins = [
  new ExtractTextPlugin("css/app.css"),
  new CopyWebPackPlugin([
    { from: "./web/static/assets/robots.txt"},
    { from: "./web/static/assets/favicon.ico"},
    { from: "./web/static/assets/semantic/dist", to: "semantic", toType: 'dir'},
    { from: "./web/static/assets/images", to: "images", toType: 'dir'},
    { from: "./deps/phoenix_html/web/static/js/phoenix_html.js",
      to: "js/phoenix_html.js"
    },
    { from: "./deps/phoenix/web/static/js/phoenix.js",
      to: "js/phoenix.js"
    }
  ])
];

if (prod) {
  plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  devtool: "cheap-module-source-map",
  context: path.join(__dirname),
  entry: {
    "app": ["./web/static/js/app.js", "./web/static/css/app.scss"]
  },
  output: {
    path: "./priv/static",
    filename: "js/app.js"
  },
  resolve: {
    modulesDirectories: [__dirname + "/web/static/js", path.resolve("./node_modules")],
    alias: {
      phoenix_html: __dirname + "/deps/phoenix_html/web/static/js/phoenix_html.js",
      phoenix: __dirname + "/deps/phoenix/web/static/js/phoenix.js",
      operator_message_form: path.resolve("./web/static/js/operator/message_form.jsx"),
      operator_message_box: path.resolve("./web/static/js/operator/message_box.jsx"),
      operator_users_list: path.resolve("./web/static/js/operator/users_list.jsx"),
      operator_user_detail: path.resolve("./web/static/js/operator/user_detail.jsx"),
      operator_message: path.resolve("./web/static/js/operator/message.jsx"),
      client_comment_box: path.resolve("./web/static/js/client/comment_box.jsx"),
      client_simple_login: path.resolve("./web/static/js/client/simple_login.jsx"),
      client_comment_form: path.resolve("./web/static/js/client/comment_form.jsx"),
      client_comment_list: path.resolve("./web/static/js/client/comment_list.jsx"),
      client_comment: path.resolve("./web/static/js/client/comment.jsx"),
    }
  },
  module: {
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /node_modules|semantic/,
        loader: "babel-loader",
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules|semantic/,
        loader: ExtractTextPlugin.extract("style", "css")
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style",'css!sass?outputStyle=expanded&' +
          'includePaths[]=' + (path.resolve(__dirname, './bower_components')) + '&' +
          'includePaths[]=' + (path.resolve(__dirname, './node_modules'))
          )
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url?limit=10000'
      },
      {
        test: /\.woff$/,
        loader: 'url?limit=100000'
      }
    ]
  },
  plugins: plugins
}
