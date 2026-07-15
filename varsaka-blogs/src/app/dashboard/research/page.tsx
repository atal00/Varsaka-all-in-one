import { ResearchClientView } from './research-client-view';

async function getResearch() {
  try {
    const res = await fetch('http://127.0.0.1:3001/research', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function ResearchPage() {
  const research = await getResearch();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Deep Research</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your autonomous AI research tasks and view extracted intelligence.</p>
      </div>
      
      <ResearchClientView initialResearch={research} />
    </div>
  );
}
