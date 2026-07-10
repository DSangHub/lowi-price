import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = () => (
  <div style={{
    background:'#0D1117',
    color:'#F0A500',
    minHeight:'100vh',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontFamily:'sans-serif',
    fontSize:24,
    flexDirection:'column',
    gap:16
  }}>
    <span style={{fontSize:64}}>🦉</span>
    <span>LowisPice — Coming Soon</span>
    <span style={{fontSize:14,color:'#8B949E'}}>Price smarter. Always.</span>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
