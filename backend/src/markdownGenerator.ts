/**
 * Markdown generator module
 * Generates formatted release notes and changelogs from categorized commits
 */

import { CategorizedCommits, ParsedCommit } from './types';

/**
 * Sort commits chronologically by date (oldest first)
 * @param commits Array of commits to sort
 * @returns Sorted array of commits
 */
function sortCommitsChronologically(commits: ParsedCommit[]): ParsedCommit[] {
  return [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Format a commit as a markdown list item
 * @param commit The commit to format
 * @returns Markdown formatted string
 */
function formatCommitItem(commit: ParsedCommit): string {
  const scopePrefix = commit.scope ? `**${commit.scope}**: ` : '';
  const reference = commit.prNumber ? ` (#${commit.prNumber})` : ` (${commit.hash.substring(0, 7)})`;
  return `- ${scopePrefix}${commit.description}${reference}`;
}

/**
 * Generate release notes from categorized commits
 * Includes sections for Features (feat) and Bug Fixes (fix)
 * Excludes docs and chore commits
 * Sorts entries chronologically within each section
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @param commits Categorized commits
 * @returns Markdown formatted release notes
 */
export function generateReleaseNotes(commits: CategorizedCommits): string {
  const sections: string[] = [];
  
  // Features section
  if (commits.features.length > 0) {
    sections.push('## Features\n');
    const sortedFeatures = sortCommitsChronologically(commits.features);
    sortedFeatures.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // Bug Fixes section
  if (commits.fixes.length > 0) {
    sections.push('## Bug Fixes\n');
    const sortedFixes = sortCommitsChronologically(commits.fixes);
    sortedFixes.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // If no features or fixes, return a message
  if (commits.features.length === 0 && commits.fixes.length === 0) {
    return '# Release Notes\n\nNo features or bug fixes in this release.\n';
  }
  
  return '# Release Notes\n\n' + sections.join('\n').trim() + '\n';
}

/**
 * Generate comprehensive changelog from categorized commits
 * Includes sections for Features, Bug Fixes, Documentation, and Chores
 * Groups commits by feature/bug level with high-level descriptions
 * Includes commit hashes or PR numbers as references
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * @param commits Categorized commits
 * @returns Markdown formatted changelog
 */
export function generateChangelog(commits: CategorizedCommits): string {
  const sections: string[] = [];
  
  // Features section
  if (commits.features.length > 0) {
    sections.push('## Features\n');
    const sortedFeatures = sortCommitsChronologically(commits.features);
    sortedFeatures.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // Bug Fixes section
  if (commits.fixes.length > 0) {
    sections.push('## Bug Fixes\n');
    const sortedFixes = sortCommitsChronologically(commits.fixes);
    sortedFixes.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // Documentation section
  if (commits.docs.length > 0) {
    sections.push('## Documentation\n');
    const sortedDocs = sortCommitsChronologically(commits.docs);
    sortedDocs.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // Chores section
  if (commits.chores.length > 0) {
    sections.push('## Chores\n');
    const sortedChores = sortCommitsChronologically(commits.chores);
    sortedChores.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // Uncategorized section (if any)
  if (commits.uncategorized.length > 0) {
    sections.push('## Other Changes\n');
    const sortedUncategorized = sortCommitsChronologically(commits.uncategorized);
    sortedUncategorized.forEach(commit => {
      sections.push(formatCommitItem(commit));
    });
    sections.push(''); // Empty line after section
  }
  
  // If no commits at all, return a message
  const totalCommits = commits.features.length + commits.fixes.length + 
                       commits.docs.length + commits.chores.length + 
                       commits.uncategorized.length;
  
  if (totalCommits === 0) {
    return '# Changelog\n\nNo changes in this period.\n';
  }
  
  return '# Changelog\n\n' + sections.join('\n').trim() + '\n';
}
