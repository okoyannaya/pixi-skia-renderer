import './style.css'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Application root element was not found.')
}
