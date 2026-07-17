import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function SecurityLogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('IpBlock')
      .select('*')
      .order('updatedAt', { ascending: false });
    
    if (data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const togglePermanentBlock = async (log) => {
    const { error } = await supabase
      .from('IpBlock')
      .update({ isPermanent: !log.isPermanent })
      .eq('id', log.id);
    
    if (!error) {
      fetchLogs();
    }
  };

  const clearBlock = async (log) => {
    const { error } = await supabase
      .from('IpBlock')
      .update({ failedAttempts: 0, blockedUntil: null, isPermanent: false })
      .eq('id', log.id);
    
    if (!error) {
      fetchLogs();
    }
  };

  return (
    <div className="dash-panel">
      <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Security Logs (IP Blocks)</h2>
        <button className="btn-refresh" onClick={fetchLogs} disabled={loading}>↻ {loading ? '...' : 'Refresh'}</button>
      </div>
      
      <table className="portal-table" style={{marginTop: '1rem'}}>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>App</th>
            <th>Failed Attempts</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading security logs...</td></tr>
          ) : logs.length === 0 ? (
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No IP blocks found. System is secure!</td></tr>
          ) : logs.map(log => {
            const isTempBlocked = log.blockedUntil && new Date(log.blockedUntil) > new Date();
            const isBlocked = log.isPermanent || isTempBlocked;
            
            return (
              <tr key={log.id}>
                <td><strong>{log.ip}</strong></td>
                <td><span className="pill badge-purple" style={{textTransform: 'uppercase'}}>{log.app}</span></td>
                <td><span style={{color: log.failedAttempts >= 3 ? 'red' : 'inherit', fontWeight: 'bold'}}>{log.failedAttempts}</span></td>
                <td>
                  {log.isPermanent ? (
                    <span className="status-badge status-lost">PERMANENTLY BLOCKED</span>
                  ) : isTempBlocked ? (
                    <span className="status-badge status-in-progress">BLOCKED (24h)</span>
                  ) : (
                    <span className="status-badge status-won">ACTIVE</span>
                  )}
                </td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    {isBlocked ? (
                      <button className="btn-action" style={{background: '#10b981', color: 'white', border: 'none'}} onClick={() => clearBlock(log)}>Unblock</button>
                    ) : (
                      <button className="btn-action" style={{background: '#ef4444', color: 'white', border: 'none'}} onClick={() => togglePermanentBlock(log)}>Ban IP</button>
                    )}
                    
                    {!log.isPermanent && isBlocked && (
                       <button className="btn-action" style={{background: '#ef4444', color: 'white', border: 'none'}} onClick={() => togglePermanentBlock(log)}>Ban IP</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
