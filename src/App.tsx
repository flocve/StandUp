import './App.css';
import { Dashboard } from './ui/pages/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeSelector } from './ui/components/ThemeSelector';
import { UnicornParticles } from './ui/components/UnicornParticles';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <UnicornParticles />
        <ThemeSelector />
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;
