import { Routes, Route } from 'react-router-dom'
import './App.css';
import 'leaflet/dist/leaflet.css';
import AuthForm from './pages/AuthForm';
import Home from './pages/Home';
import Report from './pages/Report';
import RequireAuth from './context/RequireAuth';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/report"
        element={
          <RequireAuth>
            <Report />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
)
