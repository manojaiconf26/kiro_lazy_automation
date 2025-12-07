import { VersionControlProvider } from '../types';
import { GitHubProvider } from './GitHubProvider';

/**
 * Select appropriate version control provider based on repository URL
 * @param repositoryUrl Repository URL
 * @param token Optional access token for authentication
 * @returns Provider instance
 * @throws Error if URL format is not recognized
 */
export function selectProvider(
  repositoryUrl: string,
  token?: string
): VersionControlProvider {
  // Check if URL is a GitHub repository
  if (repositoryUrl.includes('github.com')) {
    return new GitHubProvider(token);
  }

  // Future: Add support for other providers
  // if (repositoryUrl.includes('bitbucket.org')) {
  //   return new BitbucketProvider(token);
  // }

  throw new Error(
    'Unsupported repository URL. Currently only GitHub repositories are supported.'
  );
}
