const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const customProperties = require('postcss-custom-properties');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const {
  NoEmitOnErrorsPlugin,
  SourceMapDevToolPlugin,
  DefinePlugin,
  NamedModulesPlugin
} = require('webpack');
const {
  BaseHrefWebpackPlugin,
  ScriptsWebpackPlugin
} = require('@angular/cli/plugins/webpack');
const {
  AngularCompilerPlugin
} = require('@ngtools/webpack');
const ConcatPlugin = require('webpack-concat-plugin');

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";

const postcssPlugins = function () {
  // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
  const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
  const minimizeOptions = {
    autoprefixer: false,
    safe: true,
    mergeLonghand: false,
    discardComments: {
      remove: (comment) => !importantCommentRe.test(comment)
    }
  };
  return [
    postcssUrl({
      url: (obj) => {
        if (!obj.url.startsWith('/') || obj.url.startsWith('//')) {
          return obj.url;
        }
        if (deployUrl.match(/:\/\//)) {
          // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
          return `${deployUrl.replace(/\/$/, '')}${obj.url}`;
        } else if (baseHref.match(/:\/\//)) {
          // If baseHref contains a scheme, include it as is.
          return baseHref.replace(/\/$/, '') +
            `/${deployUrl}/${obj.url}`.replace(/\/\/+/g, '/');
        } else {
          // Join together base-href, deploy-url and the original URL.
          // Also dedupe multiple slashes into single ones.
          return `/${baseHref}/${deployUrl}/${obj.url}`.replace(/\/\/+/g, '/');
        }
      }
    }),
    autoprefixer(),
    customProperties({
      preserve: true
    })
  ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};

const isProd = process.env.NODE_ENV === 'production';

//add all external css to be added in our index.html--> like as if it's .angular-cli.json
const styles = [
  "./src/css/styles.scss"
];

//we add all our external scripts we want to load externally, like inserting in our index.html --> like as if it's .angular-cli.json
const scripts = [];

//create file path for each , so we use for our excludes and includes where needed
let style_paths = styles.map(style_src => path.join(process.cwd(), style_src));

function getPlugins() {
  var plugins = [];

  // Always expose NODE_ENV to webpack, you can now use `process.env.NODE_ENV`
  // inside your code for any environment checks; UglifyJS will automatically
  // drop any unreachable code.
  plugins.push(new DefinePlugin({
    "process.env.NODE_ENV": isProd ? "\"production\"": "\"development\""
  }));

  plugins.push(new NoEmitOnErrorsPlugin());

  if (scripts.length > 0) {
    plugins.push(new ConcatPlugin({
      "uglify": false,
      "sourceMap": true,
      "name": "scripts",
      "fileName": "[name].bundle.js",
      "filesToConcat": scripts
    }));
    plugins.push(new ScriptsWebpackPlugin({
      name: "scripts",
      sourceMap: true,
      scripts: scripts
    }));
  }

  plugins.push(new CopyWebpackPlugin([{
    "context": "src",
    "to": "",
    "from": {
      "glob": "animation/**/*",
      "dot": true
    }
  }]));

    plugins.push(new CopyWebpackPlugin([{
        "context": "",
        "to": "",
        "from": {
            "glob": "backend/**/*",
            "dot": true
        }
    }]));

  plugins.push(new ProgressPlugin());

  plugins.push(new CircularDependencyPlugin({
    "exclude": /(\\|\/)node_modules(\\|\/)/,
    "failOnError": false
  }));

  plugins.push(new HtmlWebpackPlugin({
    "template": "./src/index.html",
    "filename": "./index.html",
    "hash": false,
    "inject": true,
    "compile": true,
    "favicon": false,
    "minify": isProd && {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      removeComments: true,
      removeEmptyAttributes: true,
    },
    "cache": true,
    "showErrors": true,
    "chunks": "all",
    "title": "Overhold",
    "xhtml": true
  }));

  plugins.push(new BaseHrefWebpackPlugin({}));

  plugins.push(new SourceMapDevToolPlugin({
    "filename": "[file].map[query]",
    "moduleFilenameTemplate": "[resource-path]",
    "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
    "sourceRoot": "webpack:///"
  }));

  plugins.push(new NamedModulesPlugin({}));

  plugins.push(new ExtractTextPlugin({
    filename: "./styles.css"
  }));


  if (isProd) {
    plugins.push(new AngularCompilerPlugin({
      "mainPath": "main.ts",
      "platform": 0,
      "sourceMap": false,
      "tsConfigPath": "src/tsconfig.app.json",
      "skipCodeGeneration": true,
      "compilerOptions": {},
      "hostReplacementPaths": {
        "environments/index.ts": `environments/index.prod.ts`
      },
      "exclude": []
    }));
  } else {
    plugins.push(new AngularCompilerPlugin({
      "mainPath": "main.ts",
      "platform": 0,
      "sourceMap": true,
      "tsConfigPath": "src/tsconfig.app.json",
      "skipCodeGeneration": true,
      "compilerOptions": {},
      "hostReplacementPaths": {
        "environments/index.ts": "environments/index.ts"
      },
      "exclude": []
    }));
  }

  return plugins;
}

module.exports = {
  "mode": "development",
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        cache: true,
        uglifyOptions: {
          ecma: 6
        }
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  },
  "externals": {
    "electron": "require('electron')",
    "crypto": "require('crypto')",
    "child_process": "require('child_process')",
    "crypto": "require('crypto')",
    "fs": "require('fs')",
    "crypto-js": "require('crypto-js')",
  },
  "resolve": {
    "extensions": [
      ".ts",
      ".js",
      ".scss",
      ".json"
    ],
    "aliasFields": [],
    "alias": { // WORKAROUND See. angular-cli/issues/5433
      "environments": isProd ? path.resolve(__dirname, 'src/environments/index.prod.ts') : path.resolve(__dirname, 'src/environments/index.ts')
    },
    "modules": [
      "./node_modules"
    ],
    "mainFields": [
      "browser",
      "module",
      "main"
    ]
  },
  "resolveLoader": {
    "modules": [
      "./node_modules"
    ]
  },
  "entry": {
    "main": [
      "./src/main.ts"
    ]
  },
  "output": {
    "path": path.join(process.cwd(), "dist"),
    "filename": "[name].bundle.js"
  },
  "module": {
    "rules": [{
        "test": /\.html$/,
        "use": ["html-loader"]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        "use": ["file-loader?name=[path][name].[ext]"]
      },
      {
        test: /\.(jpe?g)$/i,
        use: [
          "file-loader?name=[path][name].[ext]"
        ]
      },
      {
        test: /\.(png|gif|svg)$/i,
        use: [
          "file-loader?name=[path][name].[ext]",
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          },
        ]
      },
      {
        "exclude": style_paths,
        "test": /\.css$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      },
      {
        "exclude": style_paths,
        "test": /\.scss$|\.sass$/,
        "use": [
          "exports-loader?module.exports.toString()",
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          },
          {
            "loader": "sass-loader",
            "options": {
              "sourceMap": false,
              "precision": 8,
              "includePaths": []
            }
          }
        ]
      },
      {
        "include": style_paths,
        "test": /\.css$/,
        "use": ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            }
          ]
        })
      },
      {
        "include": style_paths,
        "test": /\.scss$|\.sass$/,
        "use": ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              "loader": "css-loader",
              "options": {
                "sourceMap": false,
                "importLoaders": 1
              }
            },
            {
              "loader": "postcss-loader",
              "options": {
                "ident": "postcss",
                "plugins": postcssPlugins
              }
            },
            {
              "loader": "sass-loader",
              "options": {
                "sourceMap": false,
                "precision": 8,
                "includePaths": []
              }
            }
          ]
        })
      },
      {
        "test": /\.ts$/,
        "use": "@ngtools/webpack"
      }
    ]
  },
  "plugins": getPlugins(),
  "node": {
    fs: "empty",
    global: true,
    crypto: "empty",
    tls: "empty",
    net: "empty",
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false,
    __dirname: false,
    __filename: false
  }
};
