import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { IconBot } from './Icons';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user, error } = await authService.login(email, password);
        if (error) setError(error);
        else if (user) onLogin(user);
      } else {
        const { user, error } = await authService.signUp(email, password);
        if (error) setError(error);
        else if (user) onLogin(user);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] p-4">
      <div className="bg-crypto-panel w-full max-w-md p-8 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-crypto-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-crypto-accent rounded-full flex items-center justify-center text-black shadow-lg shadow-crypto-accent/20">
              <IconBot className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-8">
            {isLogin ? 'Sign in to access AstroTrade AI' : 'Join the autonomous trading revolution'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {isLogin ? 'Email or Username' : 'Email Address'}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-crypto-accent outline-none transition-colors"
                placeholder={isLogin ? "admin" : "you@example.com"}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg p-3 text-white focus:border-crypto-accent outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-crypto-red text-sm bg-crypto-red/10 p-2 rounded text-center border border-crypto-red/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-black transition-all transform hover:scale-[1.02] ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-crypto-green hover:bg-green-400 shadow-lg shadow-green-500/20'
              }`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-crypto-accent hover:underline font-bold"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};