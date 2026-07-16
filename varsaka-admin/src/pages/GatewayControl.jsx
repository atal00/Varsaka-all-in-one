import React, { useState, useEffect } from 'react';
import './GatewayControl.css';

export default function GatewayControl() {
  const [apps, setApps] = useState([]);
  const [ips, setIps] = useState([]);
  const [newIp, setNewIp] = useState('');
  const [token, setToken] = useState(localStorage.getItem('varsaka_token') || '');

  // Note: To use this dashboard, you must be logged in as an admin via the gateway.
  // We assume the token is stored in localStorage.

  useEffect(() => {
    if (!token) return;
    fetchApps();
    fetchIps();
  }, [token]);

  const fetchApps = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/apps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApps(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIps = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/ips', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIps(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleApp = async (appName, currentStatus) => {
    try {
      await fetch('http://localhost:8080/api/admin/apps/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appName, isOnline: !currentStatus })
      });
      fetchApps();
    } catch (e) {
      console.error(e);
    }
  };

  const blockIp = async () => {
    if (!newIp) return;
    try {
      await fetch('http://localhost:8080/api/admin/ips/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ipAddress: newIp, reason: 'Manual Block' })
      });
      setNewIp('');
      fetchIps();
    } catch (e) {
      console.error(e);
    }
  };

  const unblockIp = async (ipAddress) => {
    try {
      await fetch('http://localhost:8080/api/admin/ips/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ipAddress })
      });
      fetchIps();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="gateway-control">
      <h1>Varsaka Gateway Control</h1>
      <p>Manage application statuses and IP blocking centrally.</p>
      
      {!token && (
        <div className="alert error">
          You are not logged in with a Gateway Token. Please ensure you log in via the unified auth system.
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <h2>Application Status</h2>
          <ul>
            {apps.map(app => (
              <li key={app.id} className="app-item">
                <span>{app.id.toUpperCase()}</span>
                <button 
                  className={app.isOnline ? 'btn-on' : 'btn-off'}
                  onClick={() => toggleApp(app.id, app.isOnline)}
                >
                  {app.isOnline ? 'ONLINE (Click to Shutdown)' : 'OFFLINE (Click to Start)'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Blocked IPs</h2>
          <div className="ip-input">
            <input 
              type="text" 
              placeholder="Enter IP Address (e.g., 192.168.1.1)" 
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />
            <button onClick={blockIp}>Block IP</button>
          </div>
          <ul>
            {ips.map(ip => (
              <li key={ip.id} className="ip-item">
                <span>{ip.ipAddress}</span>
                <button className="btn-unblock" onClick={() => unblockIp(ip.ipAddress)}>Unblock</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
