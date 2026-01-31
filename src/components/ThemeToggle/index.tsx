// src/components/ThemeToggle.jsx
import { useTheme } from '../../context/ThemeContext';
import './styles.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export { ThemeToggle };