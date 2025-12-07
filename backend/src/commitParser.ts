/**
 * Commit parser module
 * Parses conventional commit messages and categorizes commits by type
 */

import { Commit, ParsedCommit, CategorizedCommits } from './types';

/**
 * Regular expression to match conventional commit format
 * Format: type(scope): description
 * or: type: description
 */
const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|docs|chore)(?:\(([^)]+)\))?:\s*(.+)/i;

/**
 * Parse a commit message to extract type, scope, and description
 * Supports conventional commit formats: feat:, fix:, docs:, chore:
 * Commits without conventional format are categorized as "uncategorized"
 * 
 * @param commit The commit to parse
 * @returns Parsed commit with type, scope, description, and breaking change flag
 */
export function parseCommit(commit: Commit): ParsedCommit {
  const match = commit.message.match(CONVENTIONAL_COMMIT_REGEX);
  
  if (match) {
    const [, type, scope, description] = match;
    const normalizedType = type.toLowerCase() as 'feat' | 'fix' | 'docs' | 'chore';
    
    // Check for breaking change indicator
    const breakingChange = commit.message.includes('BREAKING CHANGE') || 
                          commit.message.includes('!:');
    
    return {
      ...commit,
      type: normalizedType,
      scope: scope || undefined,
      description: description.trim(),
      breakingChange
    };
  }
  
  // Commit doesn't match conventional format
  return {
    ...commit,
    type: 'uncategorized',
    scope: undefined,
    description: commit.message.trim(),
    breakingChange: false
  };
}

/**
 * Categorize an array of commits by their type
 * Groups commits into features, fixes, docs, chores, and uncategorized
 * 
 * @param commits Array of commits to categorize
 * @returns Commits grouped by type
 */
export function categorizeCommits(commits: Commit[]): CategorizedCommits {
  const parsedCommits = commits.map(parseCommit);
  
  return {
    features: parsedCommits.filter(c => c.type === 'feat'),
    fixes: parsedCommits.filter(c => c.type === 'fix'),
    docs: parsedCommits.filter(c => c.type === 'docs'),
    chores: parsedCommits.filter(c => c.type === 'chore'),
    uncategorized: parsedCommits.filter(c => c.type === 'uncategorized')
  };
}
