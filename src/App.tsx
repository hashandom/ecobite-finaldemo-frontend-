import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'glass-card text-text shadow-xl !bg-card/90 !backdrop-blur-md border !border-border/50',
          duration: 4000,
          style: {
            padding: '16px',
            color: 'var(--color-text)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'white',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
