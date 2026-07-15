"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Database, ExternalLink, Trash2 } from 'lucide-react';

export function ResearchClientView({ initialResearch }: { initialResearch: any[] }) {
  const [topicName, setTopicName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    
    setIsScanning(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/research/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: topicName.trim() })
      });
      
      if (res.ok) {
        setTopicName('');
        router.refresh();
      }
    } catch (err) {
      console.error("Error scanning web", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(initialResearch.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (idsToDelete: string[]) => {
    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} item(s)?`)) return;
    setIsDeleting(true);
    try {
      await Promise.all(idsToDelete.map(id => 
        fetch(`http://127.0.0.1:3001/research/${id}`, { method: 'DELETE' })
      ));
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error("Error deleting research", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search / Scan Bar */}
      <div className="bg-gradient-to-r from-primary to-green-800 rounded-xl shadow-md p-8 text-primary-foreground">
        <h2 className="text-2xl font-serif font-medium mb-2">Deep Web Scanner</h2>
        <p className="text-primary-foreground/80 font-sans mb-6">Enter any topic to dispatch our AI agents. They will crawl the web and extract key facts.</p>
        
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-v-muted" />
            </div>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-v-muted focus:ring-2 focus:ring-primary text-lg shadow-inner"
              placeholder="e.g., The impact of AI Agents on Healthcare"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !topicName.trim()}
            className="flex items-center justify-center px-8 py-3 bg-foreground text-background hover:bg-v-muted font-medium font-sans rounded-lg transition-colors shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning Web...</>
            ) : (
              'Scan Web'
            )}
          </button>
        </form>
      </div>

      {/* Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-surface2 p-4 rounded-xl border border-border">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} item(s) selected</span>
          <button
            onClick={() => handleDelete(Array.from(selectedIds))}
            disabled={isDeleting}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete Selected
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        {initialResearch.length === 0 ? (
          <div className="p-12 text-center text-v-muted">
            No research reports found. Scan a topic above to begin!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface2">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === initialResearch.length && initialResearch.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-v-muted uppercase tracking-wider">Topic</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-v-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-v-muted uppercase tracking-wider">Sources Crawled</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-v-muted uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-v-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {initialResearch.map((report: any) => (
                <tr key={report.id} className={`hover:bg-surface2/50 transition-colors ${selectedIds.has(report.id) ? 'bg-surface2/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onChange={(e) => handleSelect(report.id, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-foreground">{report.topicName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-[#E5F3EC] text-[#2F6F4E]">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-v-muted">
                    {report.sourcesCount || 0} URLs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-v-muted">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/dashboard/research/${report.id}`} className="inline-flex items-center text-primary hover:text-primary/80">
                        View <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                      <button 
                        onClick={() => handleDelete([report.id])}
                        disabled={isDeleting}
                        className="text-v-muted hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
