import { ThemeProvider } from './context/ThemeContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Editor } from './components/Editor';
import { Chart } from './components/Chart';
import { ResizablePanel } from './components/ResizablePanel';
import './styles/themes.css';
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <ConnectionProvider>
        <div className="app">
          <ThemeToggle />
          <main className="content">
            <ResizablePanel
              topContent={<Editor />}
              bottomContent={<Chart />}
              initialTopHeight={55}
              minTopHeight={20}
              minBottomHeight={20}
            />
          </main>
        </div>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
export default App;
