import React from 'react';
import { renderToString } from 'react-dom/server';
import Portal from './src/pages/Portal.jsx';

// Mock everything needed
jest.mock('react-router-dom', () => ({
  useNavigate: () => (() => {})
}));

jest.mock('react-helmet-async', () => ({
  Helmet: ({children}) => <div>{children}</div>
}));

jest.mock('./src/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { user: { id: '123', email: 'test@example.com', user_metadata: { full_name: 'Test' } } },
    userRole: 'admin',
    signOut: () => {}
  })
}));

jest.mock('./src/supabaseClient', () => ({
  supabase: {}
}));

try {
  const html = renderToString(<Portal />);
  console.log("RENDER SUCCESS. HTML length:", html.length);
} catch (e) {
  console.error("RENDER ERROR:", e);
}
