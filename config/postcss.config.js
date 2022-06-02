const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const whitelister = require('purgecss-whitelister');

module.exports = {
  plugins: [
    autoprefixer(),
    purgecss({
      content: [
        './node_modules/@hyas/doks/layouts/**/*.html',
        './node_modules/@hyas/doks/content/**/*.md',
        './layouts/**/*.html',
        './content/**/*.md',
      ],
      safelist: [
        'lazyloaded',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'h5',
        'alert-link',
        'container-xxl',
        'container-fluid',
        ...whitelister([
          './node_modules/katex/dist/katex.css',
          './node_modules/highlight.js/scss/monokai-sublime.scss',
          './assets/scss/components/_comments.scss',
          './assets/scss/components/_buttons.scss',
          './assets/scss/components/_details.scss',
          './assets/scss/components/_forms.scss',
          './assets/scss/components/_mermaid.scss',
          './assets/scss/components/_alerts.scss',
          './assets/scss/components/_variables.scss',
          './assets/scss/components/_code.scss',
          './assets/scss/components/_syntax.scss',
          './assets/scss/components/_search.scss',
          './assets/scss/components/_dark.scss',
          './assets/scss/components/_tables.scss'
        ]),
      ],
    }),
  ],
}
