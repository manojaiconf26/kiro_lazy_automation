/**
 * Tests for markdown generator module
 */

import { generateReleaseNotes, generateChangelog } from './markdownGenerator';
import { CategorizedCommits, ParsedCommit } from './types';

describe('markdownGenerator', () => {
  // Helper function to create a test commit
  const createCommit = (
    type: 'feat' | 'fix' | 'docs' | 'chore' | 'uncategorized',
    description: string,
    date: Date,
    options: {
      scope?: string;
      hash?: string;
      prNumber?: number;
    } = {}
  ): ParsedCommit => ({
    hash: options.hash || 'abc1234567890',
    message: `${type}: ${description}`,
    author: 'Test Author',
    date,
    prNumber: options.prNumber,
    type,
    scope: options.scope,
    description,
    breakingChange: false
  });

  describe('generateReleaseNotes', () => {
    it('should include features section with feat commits', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'Add new feature', new Date('2024-01-01'), { prNumber: 123 })
        ],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toContain('## Features');
      expect(result).toContain('Add new feature');
      expect(result).toContain('#123');
    });

    it('should include bug fixes section with fix commits', () => {
      const commits: CategorizedCommits = {
        features: [],
        fixes: [
          createCommit('fix', 'Fix critical bug', new Date('2024-01-01'), { hash: 'def4567' })
        ],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toContain('## Bug Fixes');
      expect(result).toContain('Fix critical bug');
      expect(result).toContain('def4567');
    });

    it('should exclude docs and chore commits', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'Add feature', new Date('2024-01-01'))
        ],
        fixes: [],
        docs: [
          createCommit('docs', 'Update documentation', new Date('2024-01-01'))
        ],
        chores: [
          createCommit('chore', 'Update dependencies', new Date('2024-01-01'))
        ],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toContain('Add feature');
      expect(result).not.toContain('Update documentation');
      expect(result).not.toContain('Update dependencies');
    });

    it('should sort commits chronologically within each section', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'Feature C', new Date('2024-01-03')),
          createCommit('feat', 'Feature A', new Date('2024-01-01')),
          createCommit('feat', 'Feature B', new Date('2024-01-02'))
        ],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      const featureAIndex = result.indexOf('Feature A');
      const featureBIndex = result.indexOf('Feature B');
      const featureCIndex = result.indexOf('Feature C');

      expect(featureAIndex).toBeLessThan(featureBIndex);
      expect(featureBIndex).toBeLessThan(featureCIndex);
    });

    it('should format output as valid markdown', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'New feature', new Date('2024-01-01'))
        ],
        fixes: [
          createCommit('fix', 'Bug fix', new Date('2024-01-01'))
        ],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toMatch(/^# Release Notes\n/);
      expect(result).toContain('## Features');
      expect(result).toContain('## Bug Fixes');
      expect(result).toMatch(/- .+/); // List items
    });

    it('should include scope in formatted output when present', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'Add authentication', new Date('2024-01-01'), { 
            scope: 'auth',
            prNumber: 42 
          })
        ],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toContain('**auth**:');
      expect(result).toContain('Add authentication');
    });

    it('should return message when no features or fixes', () => {
      const commits: CategorizedCommits = {
        features: [],
        fixes: [],
        docs: [createCommit('docs', 'Update docs', new Date('2024-01-01'))],
        chores: [],
        uncategorized: []
      };

      const result = generateReleaseNotes(commits);

      expect(result).toContain('No features or bug fixes');
    });
  });

  describe('generateChangelog', () => {
    it('should include all commit types in separate sections', () => {
      const commits: CategorizedCommits = {
        features: [createCommit('feat', 'New feature', new Date('2024-01-01'))],
        fixes: [createCommit('fix', 'Bug fix', new Date('2024-01-01'))],
        docs: [createCommit('docs', 'Update docs', new Date('2024-01-01'))],
        chores: [createCommit('chore', 'Update deps', new Date('2024-01-01'))],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      expect(result).toContain('## Features');
      expect(result).toContain('## Bug Fixes');
      expect(result).toContain('## Documentation');
      expect(result).toContain('## Chores');
    });

    it('should include commit hashes as references', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'New feature', new Date('2024-01-01'), { hash: 'abc1234567890' })
        ],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      expect(result).toContain('abc1234'); // First 7 chars of hash
    });

    it('should include PR numbers as references when available', () => {
      const commits: CategorizedCommits = {
        features: [
          createCommit('feat', 'New feature', new Date('2024-01-01'), { prNumber: 456 })
        ],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      expect(result).toContain('#456');
    });

    it('should format output as valid markdown', () => {
      const commits: CategorizedCommits = {
        features: [createCommit('feat', 'Feature', new Date('2024-01-01'))],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      expect(result).toMatch(/^# Changelog\n/);
      expect(result).toContain('## Features');
      expect(result).toMatch(/- .+/);
    });

    it('should sort commits chronologically within each section', () => {
      const commits: CategorizedCommits = {
        features: [],
        fixes: [
          createCommit('fix', 'Fix C', new Date('2024-01-03')),
          createCommit('fix', 'Fix A', new Date('2024-01-01')),
          createCommit('fix', 'Fix B', new Date('2024-01-02'))
        ],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      const fixAIndex = result.indexOf('Fix A');
      const fixBIndex = result.indexOf('Fix B');
      const fixCIndex = result.indexOf('Fix C');

      expect(fixAIndex).toBeLessThan(fixBIndex);
      expect(fixBIndex).toBeLessThan(fixCIndex);
    });

    it('should include uncategorized commits in Other Changes section', () => {
      const commits: CategorizedCommits = {
        features: [],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: [
          createCommit('uncategorized', 'Some change', new Date('2024-01-01'))
        ]
      };

      const result = generateChangelog(commits);

      expect(result).toContain('## Other Changes');
      expect(result).toContain('Some change');
    });

    it('should return message when no commits', () => {
      const commits: CategorizedCommits = {
        features: [],
        fixes: [],
        docs: [],
        chores: [],
        uncategorized: []
      };

      const result = generateChangelog(commits);

      expect(result).toContain('No changes in this period');
    });
  });
});
