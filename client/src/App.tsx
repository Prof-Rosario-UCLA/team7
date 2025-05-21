import { useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';

function App() {
  return (
    <>
    <div className="bg-green-500 text-white text-center p-10 rounded-lg"><h1 className="text-6xl"> BreakChekr </h1></div>
    <AuthForm/>
    </>
  )
}

export default App
