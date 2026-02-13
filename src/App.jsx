import ErrorBoundary from './components/ErrorBoundary';
import GameLayout from './components/GameLayout';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <GameLayout />
    </ErrorBoundary>
  );
}

export default App;
