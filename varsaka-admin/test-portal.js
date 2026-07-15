import React from 'react';
import { renderToString } from 'react-dom/server';
import Portal from './src/pages/Portal.jsx';

// Mock dependencies manually
import * as ReactRouterDOM from 'react-router-dom';
ReactRouterDOM.useNavigate = () => (() => {});

import * as HelmetAsync from 'react-helmet-async';
HelmetAsync.Helmet = ({children}) => React.createElement('div', null, children);

import * as AuthContext from './src/contexts/AuthContext.jsx';
AuthContext.useAuth = () => ({
  session: { user: { id: '123', email: 'test@example.com', user_metadata: { full_name: 'Test' } } },
  userRole: 'admin',
  signOut: () => {}
});

import * as SupabaseClient from './src/supabaseClient.js';
SupabaseClient.supabase = {
  from: () => ({ select: () => ({ order: () => Promise.resolve({data:[]}) }) }),
  auth: { getSession: () => Promise.resolve({data:{}}), onAuthStateChange: () => ({data:{subscription:{}}}) }
};

try {
  const html = renderToString(React.createElement(Portal));
  console.log("RENDER SUCCESS. HTML length:", html.length);
} catch (e) {
  console.error("RENDER ERROR:", e);
}
