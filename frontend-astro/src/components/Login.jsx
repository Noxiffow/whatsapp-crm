import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : authError.message
      );
      setLoading(false);
      return;
    }

    if (data?.session) {
      onLogin(data.session);
    } else {
      setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src="/win-logo.png"
          alt="WinoWin"
          className="login-logo"
        />
        <h1 className="login-title">CRM de WhatsApp</h1>
        <p className="login-subtitle">Accede con tus credenciales</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="login-input"
          />
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Accediendo…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
