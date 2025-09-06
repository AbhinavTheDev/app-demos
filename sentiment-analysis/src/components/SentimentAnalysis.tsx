import { useState, useEffect } from 'react';
import axios from 'axios';
import Sentiment from 'sentiment';
import { SentimentData, KeywordData } from '../types';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Helper function to calculate sentiment score
const getSentimentScore = (text: string): number => {
    const result = sentiment.analyze(text);
    // Normalize the score to be between -1 and 1
    return result.score / Math.max(result.tokens.length, 1);
};

// Helper function to extract keywords (simple frequency-based approach)
const extractKeywords = (texts: string[]): Map<string, number> => {
    const words = texts.join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3); // Filter out short words

    const frequencies = new Map<string, number>();
    words.forEach(word => {
        frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });
    
    return frequencies;
};


const useSocialMediaSentiment = (companyName: string) => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Reddit data fetch (using their API)
        const redditResponse = await axios.get(
          `https://www.reddit.com/search.json?q=${companyName}&sort=new&limit=100`,
          // {
          //   headers: {
          //     'User-Agent': 'YourAppName/1.0.0'
          //   }
          // }
        );
         console.log("reddit ka response:",redditResponse.data.data.children);
        // Twitter data fetch (using Twitter API v2)
        // const twitterResponse = await axios.get(
        //   `https://api.twitter.com/2/tweets/search/recent?query=${companyName}`,
        //   {
        //     headers: {
        //       'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        //     }
        //   }
        // );

        // Combine and process the data

        // from reddit
        const redditPosts = redditResponse.data.data.children.map((child: any) => ({
          text: child.data.title + ' ' + (child.data.selftext || ''),
          timestamp: new Date(child.data.created_utc * 1000).toISOString(),
        }));

        // from twitter

        // const tweets = twitterResponse.data.data.map((tweet: any) => ({
        //   text: tweet.text,
        //   timestamp: tweet.created_at,
        // }));

        // const allPosts = [...redditPosts, ...tweets];
        const allPosts = [...redditPosts];
        console.log("These are Posts:",allPosts);
        // Process sentiment data
        const sentimentResults: SentimentData[] = allPosts.reduce((acc: SentimentData[], post) => {
          const date = post.timestamp.split('T')[0];
          const existingEntry = acc.find(entry => entry.timestamp === date);
          
          const sentimentScore = getSentimentScore(post.text);
          
          if (existingEntry) {
            existingEntry.sentiment = (existingEntry.sentiment * existingEntry.volume + sentimentScore) / (existingEntry.volume + 1);
            existingEntry.volume += 1;
          } else {
            acc.push({
              timestamp: date,
              sentiment: sentimentScore,
              volume: 1,
            });
          }
          
          return acc;
        }, []);

        // Process keyword data
        const allTexts = allPosts.map(post => post.text);
        const keywords = extractKeywords(allTexts);
        
        const keywordResults: KeywordData[] = Array.from(keywords.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([keyword, count]) => {
            const keywordSentiment = getSentimentScore(keyword);
            return {
              keyword,
              count: Math.round(count),
              sentiment: keywordSentiment > 0.2 ? 'positive' : 
                        keywordSentiment < -0.2 ? 'negative' : 'neutral'
            };
          });

        setSentimentData(sentimentResults);
        setKeywordData(keywordResults);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [companyName]);

  return { sentimentData, keywordData, loading, error };
};

export default useSocialMediaSentiment;