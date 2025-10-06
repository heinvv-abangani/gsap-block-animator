const path = require('path');

module.exports = {
  entry: {
    editor: './assets/typescript/editor.ts',
    frontend: './assets/typescript/frontend.ts'
  },
  output: {
    path: path.resolve(__dirname, 'assets/dist'),
    filename: 'js/[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'assets/typescript'),
      '@/types': path.resolve(__dirname, 'assets/typescript/types'),
      '@/components': path.resolve(__dirname, 'assets/typescript/components'),
      '@/services': path.resolve(__dirname, 'assets/typescript/services'),
      '@/utils': path.resolve(__dirname, 'assets/typescript/utils'),
      '@/hooks': path.resolve(__dirname, 'assets/typescript/hooks')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/components': ['wp', 'components'],
    '@wordpress/block-editor': ['wp', 'blockEditor'],
    '@wordpress/blocks': ['wp', 'blocks'],
    '@wordpress/hooks': ['wp', 'hooks'],
    '@wordpress/compose': ['wp', 'compose'],
    '@wordpress/i18n': ['wp', 'i18n'],
    '@wordpress/data': ['wp', 'data'],
    gsap: 'gsap'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};