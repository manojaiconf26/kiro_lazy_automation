import { Octokit } from '@octokit/rest';
import {
  VersionControlProvider,
  RepositoryInfo,
  Commit,
  PullRequest,
} from '../types';

/**
 * GitHub implementation of VersionControlProvider
 */
export class GitHubProvider implements VersionControlProvider {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Parse GitHub repository URL to extract owner and repo name
   * Supports formats:
   * - https://github.com/owner/repo
   * - https://github.com/owner/repo.git
   * - https://github.com/owner/repo/
   */
  parseRepositoryUrl(url: string): RepositoryInfo {
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/\.]+)(\.git)?\/?$/;
    const match = url.match(githubUrlPattern);

    if (!match) {
      throw new Error(
        'Invalid GitHub repository URL. Expected format: https://github.com/{owner}/{repo}'
      );
    }

    return {
      owner: match[1],
      repo: match[2],
      provider: 'github',
    };
  }

  /**
   * Fetch pull requests merged within the specified date range
   */
  async fetchPullRequests(
    repo: RepositoryInfo,
    startDate: Date,
    endDate: Date,
    token?: string
  ): Promise<PullRequest[]> {
    // Create new Octokit instance if token is provided
    const client = token ? new Octokit({ auth: token }) : this.octokit;

    try {
      // Fetch merged pull requests
      const { data: pullRequests } = await client.rest.pulls.list({
        owner: repo.owner,
        repo: repo.repo,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      // Filter for merged PRs within date range
      const mergedPRs = pullRequests.filter((pr) => {
        if (!pr.merged_at) return false;
        const mergedAt = new Date(pr.merged_at);
        return mergedAt >= startDate && mergedAt <= endDate;
      });

      // Fetch commits for each PR
      const prsWithCommits = await Promise.all(
        mergedPRs.map(async (pr) => {
          const { data: commits } = await client.rest.pulls.listCommits({
            owner: repo.owner,
            repo: repo.repo,
            pull_number: pr.number,
          });

          return {
            number: pr.number,
            title: pr.title,
            mergedAt: new Date(pr.merged_at!),
            commits: commits.map((commit) => ({
              hash: commit.sha,
              message: commit.commit.message,
              author: commit.commit.author?.name || 'Unknown',
              date: new Date(commit.commit.author?.date || pr.merged_at!),
              prNumber: pr.number,
            })),
          };
        })
      );

      return prsWithCommits;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Repository not found or inaccessible');
      } else if (error.status === 401 || error.status === 403) {
        throw new Error('Authentication failed or insufficient permissions');
      } else if (error.status === 403 && error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded');
      }
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  }

  /**
   * Fetch commits created within the specified date range
   */
  async fetchCommits(
    repo: RepositoryInfo,
    startDate: Date,
    endDate: Date,
    token?: string
  ): Promise<Commit[]> {
    // Create new Octokit instance if token is provided
    const client = token ? new Octokit({ auth: token }) : this.octokit;

    try {
      // Fetch commits within date range
      const { data: commits } = await client.rest.repos.listCommits({
        owner: repo.owner,
        repo: repo.repo,
        since: startDate.toISOString(),
        until: endDate.toISOString(),
        per_page: 100,
      });

      return commits.map((commit) => ({
        hash: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        date: new Date(commit.commit.author?.date || commit.commit.committer?.date || new Date()),
        prNumber: this.extractPRNumber(commit.commit.message),
      }));
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Repository not found or inaccessible');
      } else if (error.status === 401 || error.status === 403) {
        throw new Error('Authentication failed or insufficient permissions');
      } else if (error.status === 403 && error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded');
      }
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }
  }

  /**
   * Extract PR number from commit message if present
   * Looks for patterns like (#123) or (PR #123)
   */
  private extractPRNumber(message: string): number | undefined {
    const prPattern = /\(#(\d+)\)|PR #(\d+)/i;
    const match = message.match(prPattern);
    if (match) {
      return parseInt(match[1] || match[2], 10);
    }
    return undefined;
  }
}
