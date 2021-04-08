// @todo StrictMode?
// import { StrictMode } from 'react'
import { render, hydrate } from 'preact'
import { App } from './components/App'

// @TODO: does adding both render and hydrate here add to the production artifact size? fix this if it does!
// @ts-ignore
import.meta.env.MODE === 'development'
  ? render(<App />, document.getElementById('root')!)
  : hydrate(<App />, document.getElementById('root')!)
