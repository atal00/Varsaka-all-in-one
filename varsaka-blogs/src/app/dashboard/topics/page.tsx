import { TopicsClientView } from '@/components/topics-client-view';

import { getTopics } from '@/app/actions/topics';

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <TopicsClientView initialTopics={topics} />
    </div>
  );
}
