import './App.css';
import { Home } from './ui/pages/Home';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeSelector } from './ui/components/ThemeSelector';
import { UnicornParticles } from './ui/components/UnicornParticles';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <UnicornParticles />
        <ThemeSelector />
        <Home />
      </div>
    </ThemeProvider>
  );
}

export default App;
