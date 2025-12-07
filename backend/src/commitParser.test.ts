/**
 * Unit tests for commit parser module
 */

import { parseCommit, categorizeCommits } from './commitParser';
import { Commit } from './types';

describe('commitParser', () => {
  describe('parseCommit', () => {
    const baseCommit: Commit = {
      hash: 'abc123',
      author: 'Test Author',
      date: new Date('2024-01-01'),
      message: ''
    };

    it('should parse feat commit', () => {
      const commit = { ...baseCommit, message: 'feat: add new feature' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('feat');
      expect(parsed.description).toBe('add new feature');
      expect(parsed.scope).toBeUndefined();
      expect(parsed.breakingChange).toBe(false);
    });

    it('should parse fix commit', () => {
      const commit = { ...baseCommit, message: 'fix: resolve bug' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('fix');
      expect(parsed.description).toBe('resolve bug');
    });

    it('should parse docs commit', () => {
      const commit = { ...baseCommit, message: 'docs: update readme' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('docs');
      expect(parsed.description).toBe('update readme');
    });

    it('should parse chore commit', () => {
      const commit = { ...baseCommit, message: 'chore: update dependencies' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('chore');
      expect(parsed.description).toBe('update dependencies');
    });

    it('should parse commit with scope', () => {
      const commit = { ...baseCommit, message: 'feat(api): add endpoint' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('feat');
      expect(parsed.scope).toBe('api');
      expect(parsed.description).toBe('add endpoint');
    });

    it('should handle uncategorized commits', () => {
      const commit = { ...baseCommit, message: 'random commit message' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('uncategorized');
      expect(parsed.description).toBe('random commit message');
      expect(parsed.scope).toBeUndefined();
    });

    it('should detect breaking changes with BREAKING CHANGE', () => {
      const commit = { ...baseCommit, message: 'feat: new feature\n\nBREAKING CHANGE: api changed' };
      const parsed = parseCommit(commit);
      
      expect(parsed.breakingChange).toBe(true);
    });

    it('should handle case insensitive type matching', () => {
      const commit = { ...baseCommit, message: 'FEAT: uppercase feature' };
      const parsed = parseCommit(commit);
      
      expect(parsed.type).toBe('feat');
      expect(parsed.description).toBe('uppercase feature');
    });
  });

  describe('categorizeCommits', () => {
    const commits: Commit[] = [
      {
        hash: 'abc1',
        author: 'Author 1',
        date: new Date('2024-01-01'),
        message: 'feat: feature 1'
      },
      {
        hash: 'abc2',
        author: 'Author 2',
        date: new Date('2024-01-02'),
        message: 'fix: bug fix 1'
      },
      {
        hash: 'abc3',
        author: 'Author 3',
        date: new Date('2024-01-03'),
        message: 'docs: update docs'
      },
      {
        hash: 'abc4',
        author: 'Author 4',
        date: new Date('2024-01-04'),
        message: 'chore: maintenance'
      },
      {
        hash: 'abc5',
        author: 'Author 5',
        date: new Date('2024-01-05'),
        message: 'random commit'
      },
      {
        hash: 'abc6',
        author: 'Author 6',
        date: new Date('2024-01-06'),
        message: 'feat: feature 2'
      }
    ];

    it('should categorize commits by type', () => {
      const categorized = categorizeCommits(commits);
      
      expect(categorized.features).toHaveLength(2);
      expect(categorized.fixes).toHaveLength(1);
      expect(categorized.docs).toHaveLength(1);
      expect(categorized.chores).toHaveLength(1);
      expect(categorized.uncategorized).toHaveLength(1);
    });

    it('should preserve commit data in categorized commits', () => {
      const categorized = categorizeCommits(commits);
      
      expect(categorized.features[0].hash).toBe('abc1');
      expect(categorized.features[0].author).toBe('Author 1');
      expect(categorized.features[0].description).toBe('feature 1');
    });

    it('should handle empty commit array', () => {
      const categorized = categorizeCommits([]);
      
      expect(categorized.features).toHaveLength(0);
      expect(categorized.fixes).toHaveLength(0);
      expect(categorized.docs).toHaveLength(0);
      expect(categorized.chores).toHaveLength(0);
      expect(categorized.uncategorized).toHaveLength(0);
    });
  });
});
