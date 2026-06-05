import './App.css'
import { Toaster } from 'sonner'
import AppRouter from './routes/router'

function App() {
  return (
    <>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
