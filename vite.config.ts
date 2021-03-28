import { resolve } from 'path'
import { UserConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { minifyHtml } from 'vite-plugin-html'
import { wilson } from './internal/plugins/wilson'
import wilsonConfig from './.wilson/wilson.config'

const config: UserConfig = {
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [
    wilson(wilsonConfig),
    reactRefresh(),
    minifyHtml({
      removeComments: false,
      useShortDoctype: true,
    }),
  ],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  build: {
    minify: true,
  },
}

export default config
