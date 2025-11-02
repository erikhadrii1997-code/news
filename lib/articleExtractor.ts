// lib/articleExtractor.ts
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function extractArticleContent(url: string, description: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Try different selectors for article content based on common news site structures
    const selectors = [
      'article p',
      '.article-body p',
      '.story-body p',
      '.content p',
      'main article p',
      '[role="article"] p',
      '.post-content p',
      '.entry-content p',
    ];

    let articleContent = '';
    
    for (const selector of selectors) {
      const paragraphs = $(selector);
      if (paragraphs.length > 2) { // Need at least 3 paragraphs to be meaningful
        paragraphs.each((_, elem) => {
          const text = $(elem).text().trim();
          if (text && text.length > 50) { // Only add substantial paragraphs
            articleContent += text + '\n\n';
          }
        });
        break; // Found content, stop trying other selectors
      }
    }

    // If we found content and it's longer than the description, return it
    if (articleContent.trim().length > description.length) {
      return articleContent.trim();
    }

    return description;
  } catch (error) {
    console.error('Error extracting article content:', error);
    return description; // Return original description if scraping fails
  }
}

