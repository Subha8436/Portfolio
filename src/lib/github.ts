
import type { GitHubRepo } from '@/types';

const GITHUB_USERNAME = 'Subha8436';
const CACHE_KEY = 'github_repos_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: GitHubRepo[];
  timestamp: number;
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);
      if (Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.data;
      }
    }
  } catch {}

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12&type=owner`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('GitHub API rate limit reached');
        // Return cached data if available
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return JSON.parse(cached).data;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();
    
    // Cache the result
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: repos,
        timestamp: Date.now(),
      }));
    } catch {}

    return repos;
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    // Return cached data as fallback
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached).data;
    } catch {}
    return [];
  }
}
