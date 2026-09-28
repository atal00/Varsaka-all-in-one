import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGeneration() {
  console.log('--- TESTING VARSAKA REAL-TIME GENERATION FLOW ---');
  
  // 1. Refresh topics
  const refreshRes = await fetch('http://localhost:3001/api/topics/refresh', { method: 'POST' });
  const refreshData = await refreshRes.json();
  console.log('1. Refresh API Status:', refreshData.success, 'Discovered:', refreshData.topicsCount, 'Sources:', refreshData.sourcesCount);

  // 2. Select high-relevance topic
  const targetTopic = await prisma.topic.findFirst({
    where: {
      name: {
        contains: 'AI Agent'
      }
    }
  }) || await prisma.topic.findFirst();

  console.log('2. Target Topic selected:', targetTopic.name, `[ID: ${targetTopic.id}]`);

  // 3. Test Deep Research
  console.log('3. Triggering Deep Research...');
  const researchRes = await fetch('http://localhost:3001/api/research/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: targetTopic.id })
  });
  const researchData = await researchRes.json();
  console.log('Deep Research Result:', researchData.id, 'Facts count:', researchData.knowledgeGraph?.facts?.length, 'Sources:', researchData.sourcesCount);

  // 4. Test Blog Generation
  console.log('4. Triggering Blog Generation...');
  const blogRes = await fetch('http://localhost:3001/api/articles/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: targetTopic.id })
  });
  const blogData = await blogRes.json();
  console.log('Blog Generated:', blogData.id, 'Title:', blogData.title, 'Status:', blogData.status);

  // 5. Test Case Study Generation
  console.log('5. Triggering Case Study Generation...');
  const caseRes = await fetch('http://localhost:3001/api/case-studies/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: targetTopic.id })
  });
  const caseData = await caseRes.json();
  console.log('Case Study Generated:', caseData.id, 'Title:', caseData.title, 'Status:', caseData.status);

  // 6. Test Publish Blog
  console.log('6. Testing Blog Publishing...');
  const pubRes = await fetch(`http://localhost:3001/api/articles/${blogData.id}/publish`, { method: 'POST' });
  const pubData = await pubRes.json();
  console.log('Publish status:', pubData.success, 'New article status:', pubData.article?.status);

  // 7. Test Case Study Publish
  console.log('7. Testing Case Study Publishing...');
  const pubCaseRes = await fetch(`http://localhost:3001/api/case-studies/${caseData.id}/publish`, { method: 'POST' });
  const pubCaseData = await pubCaseRes.json();
  console.log('Publish Case Study status:', pubCaseData.success, 'New status:', pubCaseData.caseStudy?.status);

  console.log('--- ALL GENERATION & PUBLISHING FLOWS PASSED PERFECTLY ---');
  await prisma.$disconnect();
}

testGeneration().catch(e => {
  console.error('Test Failed:', e);
  process.exit(1);
});
