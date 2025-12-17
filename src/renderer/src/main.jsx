import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MiniApp from './MiniApp'
import './styles/global.css' // We will create this next

const hash = window.location.hash
const isMini = hash.includes('mini')

console.log("Current Hash:", hash)
console.log("Is Mini Mode:", isMini)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isMini ? <MiniApp /> : <App />}
  </React.StrictMode>
)