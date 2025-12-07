/**
 * Backend API server for Release Notes Generator
 * Provides REST API endpoint for generating release notes and changelogs
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { selectProvider } from './providers/providerFactory';
import { categorizeCommits } from './commitParser';
import { generateReleaseNotes, generateChangelog } from './markdownGenerator';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Request body interface for /api/generate endpoint
 */
interface GenerateRequest {
  repositoryUrl: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  accessToken?: string;
}

/**
 * Response interface for /api/generate endpoint
 */
interface GenerateResponse {
  releaseNotes: string;
  changelog: string;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Validate request body for /api/generate endpoint
 * Requirements: 2.1, 9.3
 */
function validateGenerateRequest(body: any): { valid: boolean; error?: string } {
  // Check required fields
  if (!body.repositoryUrl || typeof body.repositoryUrl !== 'string') {
    return { valid: false, error: 'Repository URL is required and must be a string' };
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { valid: false, error: 'Start date is required and must be a string' };
  }

  if (!body.endDate || typeof body.endDate !== 'string') {
    return { valid: false, error: 'End date is required and must be a string' };
  }

  // Validate URL format (basic GitHub URL validation)
  const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  if (!githubUrlPattern.test(body.repositoryUrl.trim())) {
    return { 
      valid: false, 
      error: 'Invalid repository URL format. Expected: https://github.com/{owner}/{repo}' 
    };
  }

  // Validate date formats
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (isNaN(startDate.getTime())) {
    return { valid: false, error: 'Invalid start date format. Expected ISO 8601 format' };
  }

  if (isNaN(endDate.getTime())) {
    return { valid: false, error: 'Invalid end date format. Expected ISO 8601 format' };
  }

  // Validate date range
  if (endDate < startDate) {
    return { valid: false, error: 'End date must not be before start date' };
  }

  // Validate access token if provided
  if (body.accessToken !== undefined && typeof body.accessToken !== 'string') {
    return { valid: false, error: 'Access token must be a string' };
  }

  return { valid: true };
}

/**
 * POST /api/generate
 * Generate release notes and changelog for a repository
 * Requirements: 2.1, 9.3, 4.5, 9.1, 9.2, 9.3, 9.4, 10.3
 */
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = validateGenerateRequest(req.body);
    if (!validation.valid) {
      console.log(`Validation error: ${validation.error}`);
      return res.status(400).json({ 
        error: validation.error 
      } as ErrorResponse);
    }

    const { repositoryUrl, startDate, endDate, accessToken } = req.body as GenerateRequest;

    // Log request (without token)
    console.log(`Generating release notes for ${repositoryUrl} from ${startDate} to ${endDate}`);

    // Parse dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Select provider based on repository URL
    let provider;
    try {
      provider = selectProvider(repositoryUrl, accessToken);
    } catch (error: any) {
      console.error('Provider selection error:', error.message);
      return res.status(400).json({
        error: 'Invalid repository URL',
        details: error.message
      } as ErrorResponse);
    }

    // Parse repository URL
    let repoInfo;
    try {
      repoInfo = provider.parseRepositoryUrl(repositoryUrl);
    } catch (error: any) {
      console.error('URL parsing error:', error.message);
      return res.status(400).json({
        error: 'Failed to parse repository URL',
        details: error.message
      } as ErrorResponse);
    }

    // Fetch commits from provider
    let commits;
    try {
      commits = await provider.fetchCommits(
        repoInfo,
        startDateObj,
        endDateObj,
        accessToken
      );
    } catch (error: any) {
      console.error('Error fetching commits:', error.message);
      
      // Handle specific GitHub API errors
      if (error.status === 401 || error.message.includes('Bad credentials')) {
        return res.status(401).json({
          error: 'Authentication failed',
          details: 'Invalid or missing access token. Please check your credentials.'
        } as ErrorResponse);
      }
      
      if (error.status === 403) {
        // Could be rate limit or insufficient permissions
        if (error.message.includes('rate limit')) {
          return res.status(429).json({
            error: 'GitHub API rate limit exceeded',
            details: 'Please try again later or provide an access token for higher rate limits.'
          } as ErrorResponse);
        }
        return res.status(403).json({
          error: 'Access denied',
          details: 'Insufficient permissions to access this repository. Ensure your token has the required permissions.'
        } as ErrorResponse);
      }
      
      if (error.status === 404 || error.message.includes('Not Found')) {
        return res.status(404).json({
          error: 'Repository not found',
          details: 'The specified repository does not exist or you do not have access to it.'
        } as ErrorResponse);
      }
      
      // Network errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || 
          error.message.includes('network') || error.message.includes('timeout')) {
        return res.status(503).json({
          error: 'Network error',
          details: 'Unable to connect to GitHub API. Please check your internet connection and try again.'
        } as ErrorResponse);
      }
      
      // Generic error for other cases
      return res.status(500).json({
        error: 'Failed to fetch commits from repository',
        details: error.message
      } as ErrorResponse);
    }

    // Categorize commits
    const categorizedCommits = categorizeCommits(commits);

    // Generate release notes and changelog
    const releaseNotes = generateReleaseNotes(categorizedCommits);
    const changelog = generateChangelog(categorizedCommits);

    // Return response
    res.json({
      releaseNotes,
      changelog
    } as GenerateResponse);

  } catch (error: any) {
    // Catch-all for unexpected errors
    // Log detailed error for debugging
    console.error('Unexpected error generating release notes:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return generic error message to client
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: 'Please try again later. If the problem persists, contact support.'
    } as ErrorResponse);
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export { app };
