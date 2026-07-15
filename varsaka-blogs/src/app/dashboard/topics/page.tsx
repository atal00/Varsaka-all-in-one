import { TopicsClientView } from '@/components/topics-client-view';

async function getTopics() {
  // Use absolute URL since this is a server component
  try {
    const res = await fetch('http://127.0.0.1:3001/topics', {
      cache: 'no-store'
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <TopicsClientView initialTopics={topics} />
    </div>
  );
}
