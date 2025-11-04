// lib/articleExtractor.ts
import * as cheerio from 'cheerio';
import axios from 'axios';

// Function to remove source attribution text from content
export function cleanSourceAttribution(text: string): string {
  if (!text) return text;
  
  let cleaned = text;
  
  // Common source attribution patterns to remove
  const patterns = [
    // "According to [Source]"
    /\bAccording to\s+[A-Z][^.]{0,50}?\s*(?:\.|,)/gi,
    // "[Source] reports"
    /\b(?:BBC News|Reuters|CNN|The Guardian|Wall Street Journal|Bloomberg|TechCrunch|New York Times|The Verge|Engadget|Associated Press|AP News|Fox News|NBC News|CBS News|ABC News|USA Today|The Washington Post|The Times|Forbes|Business Insider|The Independent|Daily Mail|The Telegraph|Sky News|ITV News|Channel 4 News|Al Jazeera|Financial Times|The Economist|Time|Newsweek|The Atlantic|Politico|Axios|The Hill|Vox|BuzzFeed|HuffPost|Mashable|Gizmodo|Wired|Ars Technica|Engadget|The Verge|TechRadar|CNET|ZDNet|PC Mag|Digital Trends)\s+(?:reports|says|reported|said|according to|according|states|stated|confirms|confirmed|reveals|revealed|announces|announced|claims|claimed|notes|noted|writes|wrote|explains|explained|adds|added|tells|told|shows|showed|indicates|indicated|suggests|suggested|believes|believed|thinks|thought|argues|argued|observes|observed|warns|warned|warns|warned|highlights|highlighted|emphasizes|emphasized|stresses|stressed|underlines|underlined|points out|pointed out|makes clear|made clear|makes it clear|made it clear|indicates that|suggests that|believes that|thinks that|argues that|observes that|warns that|notes that|says that|reports that|states that|confirms that|reveals that|announces that|claims that|writes that|explains that|adds that|tells that|shows that)\s*[,:.]?\s*/gi,
    // "Source: [Source]"
    /\bSource:\s*[A-Z][^.]{0,50}?\s*(?:\.|,)/gi,
    // "From [Source]"
    /\bFrom\s+(?:BBC News|Reuters|CNN|The Guardian|Wall Street Journal|Bloomberg|TechCrunch|New York Times|The Verge|Engadget|Associated Press|AP News|Fox News|NBC News|CBS News|ABC News|USA Today|The Washington Post|The Times|Forbes|Business Insider|The Independent|Daily Mail|The Telegraph|Sky News|ITV News|Channel 4 News|Al Jazeera|Financial Times|The Economist|Time|Newsweek|The Atlantic|Politico|Axios|The Hill|Vox|BuzzFeed|HuffPost|Mashable|Gizmodo|Wired|Ars Technica|Engadget|The Verge|TechRadar|CNET|ZDNet|PC Mag|Digital Trends)\s*[,:.]?\s*/gi,
    // "[Source] according to"
    /\b(?:BBC News|Reuters|CNN|The Guardian|Wall Street Journal|Bloomberg|TechCrunch|New York Times|The Verge|Engadget|Associated Press|AP News|Fox News|NBC News|CBS News|ABC News|USA Today|The Washington Post|The Times|Forbes|Business Insider|The Independent|Daily Mail|The Telegraph|Sky News|ITV News|Channel 4 News|Al Jazeera|Financial Times|The Economist|Time|Newsweek|The Atlantic|Politico|Axios|The Hill|Vox|BuzzFeed|HuffPost|Mashable|Gizmodo|Wired|Ars Technica|Engadget|The Verge|TechRadar|CNET|ZDNet|PC Mag|Digital Trends)\s+according to\s+/gi,
    // "[Source] -"
    /\b(?:BBC News|Reuters|CNN|The Guardian|Wall Street Journal|Bloomberg|TechCrunch|New York Times|The Verge|Engadget|Associated Press|AP News|Fox News|NBC News|CBS News|ABC News|USA Today|The Washington Post|The Times|Forbes|Business Insider|The Independent|Daily Mail|The Telegraph|Sky News|ITV News|Channel 4 News|Al Jazeera|Financial Times|The Economist|Time|Newsweek|The Atlantic|Politico|Axios|The Hill|Vox|BuzzFeed|HuffPost|Mashable|Gizmodo|Wired|Ars Technica|Engadget|The Verge|TechRadar|CNET|ZDNet|PC Mag|Digital Trends)\s*[-–—]\s*/gi,
  ];
  
  // Apply all patterns
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove extra whitespace and clean up
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^\s*[,:.\-–—]\s*/, ''); // Remove leading punctuation
  cleaned = cleaned.replace(/\s*[,:.\-–—]\s*$/, ''); // Remove trailing punctuation
  
  return cleaned;
}

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

    // Clean source attribution from content
    articleContent = cleanSourceAttribution(articleContent.trim());
    
    // Clean source attribution from description
    const cleanedDescription = cleanSourceAttribution(description);

    // If we found content and it's longer than the description, return it
    if (articleContent.trim().length > cleanedDescription.length) {
      return articleContent.trim();
    }

    return cleanedDescription;
  } catch (error) {
    console.error('Error extracting article content:', error);
    // Clean source attribution from description even if scraping fails
    return cleanSourceAttribution(description);
  }
}

