import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { initHotjar } from './utils/hotjar.ts';

initHotjar();

createRoot(document.getElementById('root')!).render(
  <App />
)
