import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

function AuthForm() {
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => { 
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrorMsg('');
    setName('');
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload =
      mode === 'signup' ? { email, password, name } : { email, password };

    try {
      const res = await fetch(`http://localhost:3001/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`${mode === 'login' ? 'Login' : 'Signup'} successful`, data);
        const userData = {
          userId: data.userId,
          email: data.email,
          name: data.name,
          token: data.token
        };
        login(userData);
        navigate('/');
      } else {
        console.error(`${mode} failed:`, data.message);
        setErrorMsg(
          mode === 'login'
            ? 'Email and/or password are incorrect.'
            : 'This email is already in use. Please sign in instead.'
        );
      }
    } catch (err) {
      console.error('Network or server error:', err);
      setErrorMsg('Unable to connect to the server. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-accent">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </h2>
        {errorMsg && (
          <div className="mb-4 text-sm text-text font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-text" htmlFor="name">
                Username
              </label>
              <input
                id="name"
                type="text"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition"
          >
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={toggleMode} className="text-accent hover:underline font-medium">
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
