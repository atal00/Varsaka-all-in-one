import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { adminBlockIp, adminUnblockIp } from '../utils/security';

export default function SecurityLogsPanel() {
  const { userRole, userPermissions } = useAuth();
  const isAdmin = (userRole || '').toLowerCase() === 'admin';
  const isAuditor = (userRole || '').toLowerCase() === 'security_auditor';
  const canManageFirewall = isAdmin || Boolean(userPermissions?.security_ip?.manage || userPermissions?.security_ip?.block);

  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit' | 'firewall' | 'logins' | 'blocked' | 'admin_actions'
  const [auditLogs, setAuditLogs] = useState([]);
  const [ipLogs, setIpLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7d' | '30d'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'success' | 'failure' | 'blocked'
  const [actionFilter, setActionFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    ip: '',
    app: 'varsaka_main',
    permanent: false,
    durationMinutes: 1440,
    reason: ''
  });

  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState(null);
  const [unblockReason, setUnblockReason] = useState('Manually unblocked by administrator');

  const [selectedRecord, setSelectedRecord] = useState(null); // For inspect modal
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) {
        console.warn('Audit logs fetch warning:', error.message);
        setAuditLogs([]);
      } else {
        setAuditLogs(data || []);
      }
    } catch (err) {
      console.warn('Audit logs error:', err);
      setAuditLogs([]);
    }
  };

  const fetchIpLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('IpBlock')
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) {
        console.warn('IP blocks fetch warning:', error.message);
        setIpLogs([]);
      } else {
        setIpLogs(data || []);
      }
    } catch (err) {
      console.warn('IP blocks error:', err);
      setIpLogs([]);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setErrorMsg(null);
    await Promise.all([fetchAuditLogs(), fetchIpLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const totalFailedAttempts = ipLogs.reduce((sum, item) => sum + (item.failedAttempts || 0), 0);
    const successfulLogins = auditLogs.filter(l => l.action === 'login_success').length;
    const now = new Date();
    const tempBlockedIps = ipLogs.filter(item => !item.isPermanent && item.blockedUntil && new Date(item.blockedUntil) > now).length;
    const permBlockedIps = ipLogs.filter(item => item.isPermanent).length;
    const blockedLogins = auditLogs.filter(l => l.action === 'login_blocked' || l.action === 'security_ip_blocked').length;

    return {
      totalFailedAttempts,
      successfulLogins,
      tempBlockedIps,
      permBlockedIps,
      blockedLogins
    };
  }, [auditLogs, ipLogs]);

  // Unique actions list for filter dropdown
  const uniqueActions = useMemo(() => {
    const set = new Set();
    auditLogs.forEach(l => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Subtab filter
      if (activeSubTab === 'logins') {
        if (!['login_success', 'login_failed', 'login_blocked', 'security_ip_blocked'].includes(log.action)) {
          return false;
        }
      } else if (activeSubTab === 'admin_actions') {
        if ([
          'login_success', 'login_failed', 'login_blocked', 'security_ip_blocked'
        ].includes(log.action)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const logStatus = log.status || (log.action?.includes('fail') ? 'failure' : log.action?.includes('block') ? 'blocked' : 'success');
        if (logStatus !== statusFilter) return false;
      }

      // Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }

      // Date Range filter
      if (dateFilter !== 'all' && log.created_at) {
        const logTime = new Date(log.created_at).getTime();
        const now = Date.now();
        if (dateFilter === 'today' && now - logTime > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '7d' && now - logTime > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '30d' && now - logTime > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIp = (log.ip_address || '').toLowerCase().includes(q);
        const matchEmail = (log.actor_email || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchTarget = (log.target_id || '').toLowerCase().includes(q);
        const matchMeta = JSON.stringify(log.metadata || {}).toLowerCase().includes(q);
        if (!matchIp && !matchEmail && !matchAction && !matchTarget && !matchMeta) return false;
      }

      return true;
    });
  }, [auditLogs, activeSubTab, statusFilter, actionFilter, dateFilter, searchQuery]);

  // Filtered IP Logs
  const filteredIpLogs = useMemo(() => {
    return ipLogs.filter(log => {
      const now = new Date();
      const isTempBlocked = log.blockedUntil && new Date(log.blockedUntil) > now;
      const isBlocked = log.isPermanent || isTempBlocked;

      // Subtab filter
      if (activeSubTab === 'blocked' && !isBlocked) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchIp = (log.ip || '').toLowerCase().includes(q);
        const matchReason = (log.reason || '').toLowerCase().includes(q);
        const matchCreator = (log.createdBy || '').toLowerCase().includes(q);
        const matchApp = (log.app || '').toLowerCase().includes(q);
        if (!matchIp && !matchReason && !matchCreator && !matchApp) return false;
      }

      return true;
    });
  }, [ipLogs, activeSubTab, searchQuery]);

  // Paginated records
  const currentRecords = useMemo(() => {
    const isFirewallView = activeSubTab === 'firewall' || activeSubTab === 'blocked';
    const sourceList = isFirewallView ? filteredIpLogs : filteredAuditLogs;
    const startIndex = (currentPage - 1) * pageSize;
    return sourceList.slice(startIndex, startIndex + pageSize);
  }, [activeSubTab, filteredAuditLogs, filteredIpLogs, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    const isFirewallView = activeSubTab === 'firewall' || activeSubTab === 'blocked';
    const sourceList = isFirewallView ? filteredIpLogs : filteredAuditLogs;
    return Math.max(1, Math.ceil(sourceList.length / pageSize));
  }, [activeSubTab, filteredAuditLogs, filteredIpLogs, pageSize]);

  // Reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, searchQuery, dateFilter, statusFilter, actionFilter]);

  // Handle Block Submission
  const handleExecuteBlock = async (e) => {
    e.preventDefault();
    if (!blockForm.ip.trim()) {
      setErrorMsg('Please enter a valid IP address to block.');
      return;
    }
    if (!blockForm.reason.trim()) {
      setErrorMsg('A specific reason is required for security auditing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await adminBlockIp(supabase, {
      ip: blockForm.ip.trim(),
      app: blockForm.app,
      permanent: blockForm.permanent,
      durationMinutes: blockForm.permanent ? 0 : Number(blockForm.durationMinutes),
      reason: blockForm.reason.trim()
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Successfully blocked IP ${blockForm.ip.trim()} (${blockForm.permanent ? 'Permanent' : `${blockForm.durationMinutes}m`}).`);
      setShowBlockModal(false);
      setBlockForm({ ip: '', app: 'varsaka_main', permanent: false, durationMinutes: 1440, reason: '' });
      fetchAll();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(`Failed to block IP: ${res.error || 'Permission denied'}`);
    }
  };

  // Handle Unblock Submission
  const handleExecuteUnblock = async () => {
    if (!unblockTarget) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await adminUnblockIp(supabase, {
      ip: unblockTarget.ip,
      app: unblockTarget.app || 'varsaka_main',
      reason: unblockReason.trim() || 'Manually unblocked by administrator'
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Successfully unblocked IP ${unblockTarget.ip}.`);
      setShowUnblockModal(false);
      setUnblockTarget(null);
      setUnblockReason('Manually unblocked by administrator');
      fetchAll();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(`Failed to unblock IP: ${res.error || 'Permission denied'}`);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const isFirewallView = activeSubTab === 'firewall' || activeSubTab === 'blocked';
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (isFirewallView) {
      csvContent += 'IP,App,Status,BlockType,FailedAttempts,FirstSeen,LastSeen,BlockedUntil,Reason,CreatedBy\n';
      filteredIpLogs.forEach(r => {
        const now = new Date();
        const isTemp = r.blockedUntil && new Date(r.blockedUntil) > now;
        const status = r.isPermanent ? 'PERMANENTLY_BLOCKED' : isTemp ? 'TEMPORARILY_BLOCKED' : 'ACTIVE';
        csvContent += `"${r.ip}","${r.app}","${status}","${r.blockType || 'automatic'}","${r.failedAttempts}","${r.firstSeen || ''}","${r.lastSeen || ''}","${r.blockedUntil || ''}","${(r.reason || '').replace(/"/g, '""')}","${r.createdBy || ''}"\n`;
      });
    } else {
      csvContent += 'Timestamp,Actor,Action,TargetID,IP,Status,UserAgent,Metadata\n';
      filteredAuditLogs.forEach(r => {
        csvContent += `"${r.created_at}","${r.actor_email || 'System'}","${r.action}","${r.target_id || ''}","${r.ip_address || ''}","${r.status || 'success'}","${(r.user_agent || '').replace(/"/g, '""')}","${JSON.stringify(r.metadata || {}).replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `varsaka_${activeSubTab}_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dash-panel" style={{ padding: '1.25rem' }}>
      {/* HEADER SECTION */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>Security & Audit Command Center</h2>
            <span className="pill badge-blue" style={{ fontSize: '0.75rem', fontWeight: '700' }}>ENTERPRISE SECURE</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Authoritative append-only audit trail, progressive IP firewall management, and abuse defense
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {canManageFirewall && (
            <button
              className="btn-action"
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowBlockModal(true)}
            >
              🚫 Block Source IP
            </button>
          )}

          <button
            className="btn-action"
            style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>

          <button
            className="btn-refresh"
            onClick={fetchAll}
            disabled={loading}
            style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}
          >
            ↻ {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* 17. LOGIN ATTEMPT & FIREWALL SUMMARY DASHBOARD */}
      <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="stat-box" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Failed Attempts</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#dc2626', marginTop: '4px' }}>{metrics.totalFailedAttempts}</strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cumulative tracked</span>
        </div>

        <div className="stat-box" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Successful Logins</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#16a34a', marginTop: '4px' }}>{metrics.successfulLogins}</strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified sessions</span>
        </div>

        <div className="stat-box" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Temp Blocked IPs</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#ea580c', marginTop: '4px' }}>{metrics.tempBlockedIps}</strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Progressive backoff active</span>
        </div>

        <div className="stat-box" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Permanent Blocks</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#7f1d1d', marginTop: '4px' }}>{metrics.permBlockedIps}</strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Manual administrator bans</span>
        </div>

        <div className="stat-box" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Blocked Requests</span>
          <strong style={{ display: 'block', fontSize: '1.6rem', color: '#9333ea', marginTop: '4px' }}>{metrics.blockedLogins}</strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stopped at gate</span>
        </div>
      </div>

      {/* 16. SUBTABS (5 Navigation Views) */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', marginBottom: '1rem', overflowX: 'auto' }}>
        <button
          className={`filter-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🛡️ Audit Trail ({auditLogs.length})
        </button>

        <button
          className={`filter-btn ${activeSubTab === 'firewall' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('firewall')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🧱 IP Firewall ({ipLogs.length})
        </button>

        <button
          className={`filter-btn ${activeSubTab === 'logins' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('logins')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🔐 Login Attempts ({auditLogs.filter(l => ['login_success', 'login_failed', 'login_blocked', 'security_ip_blocked'].includes(l.action)).length})
        </button>

        <button
          className={`filter-btn ${activeSubTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('blocked')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🚫 Blocked IPs ({metrics.tempBlockedIps + metrics.permBlockedIps})
        </button>

        <button
          className={`filter-btn ${activeSubTab === 'admin_actions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('admin_actions')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '6px 6px 0 0', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ⚡ Admin Actions ({auditLogs.filter(l => !['login_success', 'login_failed', 'login_blocked', 'security_ip_blocked'].includes(l.action)).length})
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search IP, actor, action, reason, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '7px 12px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ padding: '7px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
        >
          <option value="all">📅 All Time</option>
          <option value="today">📅 Today (24h)</option>
          <option value="7d">📅 Last 7 Days</option>
          <option value="30d">📅 Last 30 Days</option>
        </select>

        {activeSubTab !== 'firewall' && activeSubTab !== 'blocked' && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '7px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="all">Status: All</option>
              <option value="success">✓ Success</option>
              <option value="failure">✗ Failure</option>
              <option value="blocked">⛔ Blocked</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ padding: '7px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="all">Action: All Actions</option>
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </>
        )}

        {(searchQuery || dateFilter !== 'all' || statusFilter !== 'all' || actionFilter !== 'all') && (
          <button
            onClick={() => { setSearchQuery(''); setDateFilter('all'); setStatusFilter('all'); setActionFilter('all'); }}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* MAIN DATA TABLES */}
      {(activeSubTab === 'audit' || activeSubTab === 'logins' || activeSubTab === 'admin_actions') && (
        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table className="portal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Timestamp</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Event / Action</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Actor</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Source IP</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Target</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.8rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Syncing security audit trail...
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                currentRecords.map((log) => {
                  const isBlockedAction = log.action?.includes('blocked');
                  const isFailAction = log.action?.includes('fail') || log.status === 'failure';
                  const isPermAction = log.action?.includes('permission') || log.action?.includes('role');

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="pill"
                          style={{
                            background: isBlockedAction ? '#fee2e2' : isFailAction ? '#ffedd5' : isPermAction ? '#eff6ff' : '#f0fdf4',
                            color: isBlockedAction ? '#991b1b' : isFailAction ? '#c2410c' : isPermAction ? '#1d4ed8' : '#15803d',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.85rem' }}>
                        <strong style={{ color: '#1e293b' }}>{log.actor_email || 'System'}</strong>
                        {log.actor_id && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>
                            {log.actor_id.slice(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#475569' }}>
                        {log.ip_address || '-'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>
                        {log.target_id || '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: log.status === 'blocked' ? '#fee2e2' : log.status === 'failure' ? '#ffedd5' : '#dcfce7',
                            color: log.status === 'blocked' ? '#991b1b' : log.status === 'failure' ? '#9a3412' : '#166534'
                          }}
                        >
                          {log.status || 'success'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedRecord(log)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', color: '#334155' }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 11. IP FIREWALL SUBTAB & BLOCKED IPS */}
      {(activeSubTab === 'firewall' || activeSubTab === 'blocked') && (
        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table className="portal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>IP Address</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Block Type</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Failed Attempts</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Reason</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Blocked At / Expires</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>Created By</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.8rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading IP firewall configuration...
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    {activeSubTab === 'blocked' ? 'No IP blocks currently active.' : 'No IP records registered in firewall.'}
                  </td>
                </tr>
              ) : (
                currentRecords.map((log) => {
                  const now = new Date();
                  const isTempBlocked = log.blockedUntil && new Date(log.blockedUntil) > now;
                  const isBlocked = log.isPermanent || isTempBlocked;

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {log.ip}
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                          App: {log.app}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {log.isPermanent ? (
                          <span className="status-badge status-lost" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>PERMANENTLY BLOCKED</span>
                        ) : isTempBlocked ? (
                          <span className="status-badge status-in-progress" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                            TEMPORARY BLOCK
                          </span>
                        ) : (
                          <span className="status-badge status-won" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>ACTIVE</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', textTransform: 'capitalize', color: '#475569' }}>
                        {log.blockType || 'automatic'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ color: log.failedAttempts >= 5 ? '#dc2626' : log.failedAttempts > 0 ? '#ea580c' : '#16a34a', fontWeight: 'bold' }}>
                          {log.failedAttempts || 0}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#475569', maxWidth: '220px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.reason || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.blockedAt ? (
                          <>
                            <div>Set: {new Date(log.blockedAt).toLocaleDateString()}</div>
                            {log.isPermanent ? (
                              <div style={{ color: '#991b1b', fontWeight: '600' }}>Never expires</div>
                            ) : isTempBlocked ? (
                              <div style={{ color: '#c2410c', fontWeight: '600' }}>
                                Expires: {new Date(log.blockedUntil).toLocaleTimeString()}
                              </div>
                            ) : (
                              <div>Expired</div>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem', color: '#64748b' }}>
                        {log.createdBy || 'system'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedRecord(log)}
                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', color: '#334155' }}
                          >
                            View
                          </button>

                          {isBlocked ? (
                            <button
                              onClick={() => {
                                if (!canManageFirewall) {
                                  alert('Unblocking an IP requires Administrator privileges.');
                                  return;
                                }
                                setUnblockTarget(log);
                                setShowUnblockModal(true);
                              }}
                              disabled={!canManageFirewall}
                              style={{
                                background: canManageFirewall ? '#10b981' : '#cbd5e1',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '0.75rem',
                                cursor: canManageFirewall ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (!canManageFirewall) {
                                  alert('Blocking an IP requires Administrator privileges.');
                                  return;
                                }
                                setBlockForm({
                                  ip: log.ip,
                                  app: log.app || 'varsaka_main',
                                  permanent: false,
                                  durationMinutes: 1440,
                                  reason: 'Suspicious activity detected'
                                });
                                setShowBlockModal(true);
                              }}
                              disabled={!canManageFirewall}
                              style={{
                                background: canManageFirewall ? '#ef4444' : '#cbd5e1',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '0.75rem',
                                cursor: canManageFirewall ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing page {currentPage} of {totalPages} ({activeSubTab === 'firewall' || activeSubTab === 'blocked' ? filteredIpLogs.length : filteredAuditLogs.length} total entries)
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ padding: '5px 12px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Previous
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: '600', padding: '0 8px' }}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            style={{ padding: '5px 12px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: currentPage >= totalPages ? '#f1f5f9' : '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* 12. PERMANENT & TEMPORARY BLOCK MODAL */}
      {showBlockModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ maxWidth: '480px', padding: '1.5rem', background: '#fff', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚫 Block Source IP Address
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Create an enforced server-side block for an abusive or malicious IP address. All block actions are strictly audited.
            </p>

            <form onSubmit={handleExecuteBlock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 203.0.113.10"
                  value={blockForm.ip}
                  onChange={(e) => setBlockForm({ ...blockForm, ip: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Block Classification</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      name="blockType"
                      checked={!blockForm.permanent}
                      onChange={() => setBlockForm({ ...blockForm, permanent: false })}
                    />
                    ⏱️ Temporary Block
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold' }}>
                    <input
                      type="radio"
                      name="blockType"
                      checked={blockForm.permanent}
                      onChange={() => setBlockForm({ ...blockForm, permanent: true })}
                    />
                    🔒 Permanent Block
                  </label>
                </div>
              </div>

              {!blockForm.permanent && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Block Duration</label>
                  <select
                    value={blockForm.durationMinutes}
                    onChange={(e) => setBlockForm({ ...blockForm, durationMinutes: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={360}>6 Hours</option>
                    <option value={1440}>24 Hours (1 Day)</option>
                    <option value={10080}>7 Days</option>
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                  Reason (Mandatory Audit Evidence)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Repeated automated brute-force attempts on admin portal"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  disabled={isSubmitting}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Enforcing Block...' : blockForm.permanent ? 'Confirm Permanent Block' : 'Apply Temporary Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. UNBLOCK CONFIRMATION MODAL */}
      {showUnblockModal && unblockTarget && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ maxWidth: '440px', padding: '1.5rem', background: '#fff', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔓 Confirm IP Unblock
            </h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Are you sure you want to lift the block on IP <strong>{unblockTarget.ip}</strong>? This will restore authentication access immediately and record an <code>IP_UNBLOCKED</code> audit event.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Unblock Reason</label>
              <input
                type="text"
                value={unblockReason}
                onChange={(e) => setUnblockReason(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowUnblockModal(false); setUnblockTarget(null); }}
                disabled={isSubmitting}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteUnblock}
                disabled={isSubmitting}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Unblocking...' : 'Confirm Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD INSPECT MODAL */}
      {selectedRecord && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ maxWidth: '580px', padding: '1.5rem', background: '#fff', borderRadius: '8px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                🔍 Security Audit Evidence Inspection
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Record ID:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedRecord.id}</code></div>
              <div><strong>Timestamp:</strong> {selectedRecord.created_at || selectedRecord.createdAt || 'N/A'}</div>
              <div><strong>Actor:</strong> {selectedRecord.actor_email || selectedRecord.createdBy || 'System'}</div>
              <div><strong>Action / Status:</strong> {selectedRecord.action || (selectedRecord.isPermanent ? 'PERMANENTLY_BLOCKED' : 'ACTIVE')}</div>
              <div><strong>IP Address:</strong> <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedRecord.ip_address || selectedRecord.ip || 'Unknown'}</code></div>
              <div><strong>User Agent:</strong> <span style={{ color: '#64748b' }}>{selectedRecord.user_agent || 'N/A'}</span></div>
              
              <div style={{ marginTop: '8px' }}>
                <strong>Full JSON Metadata:</strong>
                <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', overflowX: 'auto', marginTop: '4px' }}>
                  {JSON.stringify(selectedRecord.metadata || selectedRecord, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
