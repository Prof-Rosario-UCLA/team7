import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import './App.css';
import 'leaflet/dist/leaflet.css';
import AuthForm from './pages/AuthForm';
import Home from './pages/Home';
import Report from './pages/Report';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm/>}/>
      <Route path="/" element={<Home/>}/>
      <Route path="/report" element={<Report/>}/>
    </Routes>
  )
}

export default App
