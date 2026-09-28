'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Search, Loader2, FileText, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { searchInvoices } from '@/actions/invoice';

interface SearchResultItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  status: string;
  currency: string;
  total: number;
}

export function SearchInvoices() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<number>(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = ++activeRequestRef.current;

    const timer = setTimeout(async () => {
      try {
        const data = await searchInvoices(trimmed);
        // Only set results if this is still the active latest request
        if (requestId === activeRequestRef.current) {
          setResults(data as SearchResultItem[]);
          setIsOpen(true);
        }
      } catch (err) {
        if (requestId === activeRequestRef.current) {
          setResults([]);
        }
      } finally {
        if (requestId === activeRequestRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '320px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: '#f3f4f6', 
        padding: '0.5rem 0.85rem', 
        borderRadius: 'var(--radius-md)', 
        border: isOpen ? '1px solid var(--accent-primary)' : '1px solid transparent',
        transition: 'all 0.2s'
      }}>
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" color="var(--accent-primary)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
        ) : (
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
        )}
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search in Invoices..." 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            fontSize: '0.9rem', 
            width: '100%',
            color: 'var(--text-primary)'
          }} 
        />
        {query && (
          <button 
            type="button" 
            onClick={handleClear}
            style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            title="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Floating search results dropdown */}
      {isOpen && query.trim() && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          zIndex: 50,
          maxHeight: '340px',
          overflowY: 'auto'
        }}>
          {results.length > 0 ? (
            <div style={{ padding: '0.4rem 0' }}>
              <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Matching Invoices ({results.length})
              </div>
              {results.map((inv) => (
                <Link 
                  key={inv.id} 
                  href={`/app?edit=${inv.id}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: '#eff6ff', padding: '0.35rem', borderRadius: '4px', color: 'var(--accent-primary)', display: 'flex' }}>
                      <FileText size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        #{inv.invoiceNumber}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {inv.clientName} • {inv.issueDate}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {inv.currency} {inv.total.toFixed(2)}
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '3px',
                      background: inv.status === 'Paid' ? '#dcfce7' : (inv.status === 'Overdue' ? '#fee2e2' : '#fef3c7'),
                      color: inv.status === 'Paid' ? '#15803d' : (inv.status === 'Overdue' ? '#b91c1c' : '#b45309')
                    }}>
                      {inv.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No invoices found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInvoices;
