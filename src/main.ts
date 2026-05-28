import './style.css'

import { mountApp } from './app/App'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Application root element was not found.')
}

mountApp(root)
