/**
 * Tests for Express API server
 */

import request from 'supertest';
import { app } from './index';

describe('API Server', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/generate - Validation', () => {
    it('should reject request with missing repository URL', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Repository URL is required');
    });

    it('should reject request with missing start date', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Start date is required');
    });

    it('should reject request with missing end date', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          startDate: '2024-01-01'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('End date is required');
    });

    it('should reject request with invalid GitHub URL format', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://example.com/repo',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid repository URL format');
    });

    it('should reject request with invalid start date format', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid start date format');
    });

    it('should reject request with invalid end date format', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          startDate: '2024-01-01',
          endDate: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid end date format');
    });

    it('should reject request when end date is before start date', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          startDate: '2024-01-31',
          endDate: '2024-01-01'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('End date must not be before start date');
    });

    it('should accept valid request with all required fields', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          repositoryUrl: 'https://github.com/owner/repo',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      // This will fail with GitHub API error since we're not providing real credentials
      // but it should pass validation
      expect(response.status).not.toBe(400);
    });
  });
});
