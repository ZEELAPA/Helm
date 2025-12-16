import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MiniApp from './MiniApp'
import './styles/global.css' // We will create this next

const isMini = window.location.hash === '#/mini'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isMini ? <MiniApp /> : <App />}
  </React.StrictMode>
)