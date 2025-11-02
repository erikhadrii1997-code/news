// app/api/article/route.ts
import { NextRequest } from 'next/server';
import { extractArticleContent } from '../../../lib/articleExtractor';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const description = searchParams.get('description') || '';

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fullContent = await extractArticleContent(url, description);
    return new Response(JSON.stringify({ content: fullContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching article content:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch article content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

