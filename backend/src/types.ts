/**
 * Data models and interfaces for the Release Notes Generator
 */

/**
 * Repository information extracted from URL
 */
export interface RepositoryInfo {
  owner: string;
  repo: string;
  provider: 'github' | 'bitbucket';
}

/**
 * Commit information from version control system
 */
export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  prNumber?: number;
}

/**
 * Pull request information
 */
export interface PullRequest {
  number: number;
  title: string;
  mergedAt: Date;
  commits: Commit[];
}

/**
 * Parsed commit with conventional commit information
 */
export interface ParsedCommit extends Commit {
  type: 'feat' | 'fix' | 'docs' | 'chore' | 'uncategorized';
  scope?: string;
  description: string;
  breakingChange: boolean;
}

/**
 * Commits categorized by type
 */
export interface CategorizedCommits {
  features: ParsedCommit[];
  fixes: ParsedCommit[];
  docs: ParsedCommit[];
  chores: ParsedCommit[];
  uncategorized: ParsedCommit[];
}

/**
 * Version control provider interface
 * Abstracts interactions with different version control platforms
 */
export interface VersionControlProvider {
  /**
   * Parse repository URL to extract owner and repo information
   * @param url Repository URL
   * @returns Repository information
   * @throws Error if URL format is invalid
   */
  parseRepositoryUrl(url: string): RepositoryInfo;

  /**
   * Fetch pull requests merged within the specified date range
   * @param repo Repository information
   * @param startDate Start of date range (inclusive)
   * @param endDate End of date range (inclusive)
   * @param token Optional access token for authentication
   * @returns Array of pull requests
   */
  fetchPullRequests(
    repo: RepositoryInfo,
    startDate: Date,
    endDate: Date,
    token?: string
  ): Promise<PullRequest[]>;

  /**
   * Fetch commits created within the specified date range
   * @param repo Repository information
   * @param startDate Start of date range (inclusive)
   * @param endDate End of date range (inclusive)
   * @param token Optional access token for authentication
   * @returns Array of commits
   */
  fetchCommits(
    repo: RepositoryInfo,
    startDate: Date,
    endDate: Date,
    token?: string
  ): Promise<Commit[]>;
}
