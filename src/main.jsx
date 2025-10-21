import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AllJobs from './pages/AllJobs.jsx';
import Terms from './pages/Terms.jsx';
import './styles.css';

const rootElement = document.getElementById('root');
function Router() {
  const [path, setPath] = React.useState(() => window.location.pathname);
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (path === '/all-jobs') return <AllJobs />;
  if (path === '/terms') return <Terms />;
  return <App />;
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);


