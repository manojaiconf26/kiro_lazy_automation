# Design Document

## Overview

The Release Notes Generator is a full-stack web application consisting of a React-based frontend and a Node.js/Express backend. The system follows a clean architecture pattern with clear separation between the presentation layer, business logic, and external API integration. The frontend provides an intuitive form interface for users to specify repository details, while the backend handles GitHub API integration, commit parsing, and AI-powered content generation using AWS Bedrock.

The application uses a provider pattern to abstract version control platform interactions, making it straightforward to add support for additional platforms like Bitbucket in the future. The core business logic for parsing conventional commits is platform-agnostic, while AWS Bedrock is used to generate natural, human-readable release notes and changelogs from the structured commit data.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Input Form  │  │ Result View  │  │ Copy Buttons │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Express)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Business Logic Layer                       │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │ Commit Parser  │  │ Content Generator        │   │   │
│  │  │                │  │ (Bedrock Integration)    │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Provider Layer (Abstraction)                 │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │ GitHub Provider│  │ Future: Bitbucket, etc.  │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
                ┌───────────────────────────┐
                │  External Services        │
                │  ┌─────────────────────┐  │
                │  │   GitHub API        │  │
                │  └─────────────────────┘  │
                │  ┌─────────────────────┐  │
                │  │   AWS Bedrock       │  │
                │  └─────────────────────┘  │
                └───────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- CSS Modules or Tailwind CSS for styling
- Fetch API for HTTP requests

**Backend:**
- Node.js with Express
- TypeScript for type safety
- Octokit (GitHub REST API client)
- AWS SDK for JavaScript v3 (Bedrock Runtime client)
- date-fns for date manipulation

## Components and Interfaces

### Frontend Components

#### 1. App Component
Main application container that manages state and coordinates child components.

**State:**
- `formData`: Repository URL, start date, end date, access token
- `results`: Generated release notes and changelog
- `loading`: Boolean indicating request in progress
- `error`: Error message if generation fails

**Methods:**
- `handleFormSubmit()`: Validates form and sends request to backend
- `handleCopy(content)`: Copies content to clipboard

#### 2. InputForm Component
Form for collecting repository details and date range.

**Props:**
- `onSubmit`: Callback function when form is submitted
- `loading`: Boolean to disable form during processing

**Fields:**
- Repository URL (text input, required)
- Start Date (date picker, required)
- End Date (date picker, required)
- Access Token (password input, optional)

**Validation:**
- URL must match GitHub format: `https://github.com/{owner}/{repo}`
- Start date must not be in the future
- End date must not be before start date

#### 3. ResultView Component
Displays generated release notes and changelog in separate text areas.

**Props:**
- `releaseNotes`: Markdown string for release notes
- `changelog`: Markdown string for changelog
- `onCopy`: Callback function for copy button clicks

**Features:**
- Read-only text areas
- Copy button for each text area
- Visual feedback on successful copy (e.g., button text changes to "Copied!" for 2 seconds, or checkmark icon appears)

### Backend Components

#### 1. API Routes (`/api/generate`)

**Endpoint:** `POST /api/generate`

**Request Body:**
```typescript
{
  repositoryUrl: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  accessToken?: string;
}
```

**Response:**
```typescript
{
  releaseNotes: string;
  changelog: string;
}
```

**Error Response:**
```typescript
{
  error: string;
  details?: string;
}
```

#### 2. Provider Interface

```typescript
interface VersionControlProvider {
  parseRepositoryUrl(url: string): RepositoryInfo;
  fetchPullRequests(repo: RepositoryInfo, startDate: Date, endDate: Date, token?: string): Promise<PullRequest[]>;
  fetchCommits(repo: RepositoryInfo, startDate: Date, endDate: Date, token?: string): Promise<Commit[]>;
}
```

#### 3. GitHub Provider

Implements `VersionControlProvider` interface for GitHub.

**Methods:**
- `parseRepositoryUrl()`: Extracts owner and repo name from GitHub URL
- `fetchPullRequests()`: Uses Octokit to fetch merged PRs in date range
- `fetchCommits()`: Uses Octokit to fetch commits in date range

**Authentication:**
- Uses personal access token if provided
- Falls back to unauthenticated requests for public repos

#### 4. Commit Parser

Parses conventional commit messages and categorizes them.

**Methods:**
- `parseCommit(message: string)`: Extracts type, scope, and description
- `categorizeCommits(commits: Commit[])`: Groups commits by type

**Supported Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `uncategorized`: Commits without conventional format

#### 5. Content Generator (Bedrock Integration)

Uses AWS Bedrock to generate natural, human-readable release notes and changelogs from structured commit data.

**Methods:**
- `generateReleaseNotes(commits: CategorizedCommits)`: Sends commit data to Bedrock with a prompt for user-facing release notes
- `generateChangelog(commits: CategorizedCommits)`: Sends commit data to Bedrock with a prompt for comprehensive changelog

**Bedrock Configuration:**
- Model: Claude 3 Haiku (fast and cost-effective) or Claude 3.5 Sonnet (higher quality)
- Region: Configurable via environment variable (default: us-east-1)
- Temperature: 0.3 (for consistent, factual output)
- Max tokens: 4096

**Prompt Strategy:**

*Release Notes Prompt:*
```
Generate user-friendly release notes from the following commits. Focus on features and bug fixes that matter to end users. Use clear, non-technical language. Format as markdown with ## Features and ## Bug Fixes sections.

Commits:
[JSON structure with categorized commits]

Requirements:
- Group related changes together
- Use bullet points
- Include PR/commit references in parentheses
- Exclude technical details like chores and docs
- Keep descriptions concise and user-focused
```

*Changelog Prompt:*
```
Generate a comprehensive changelog from the following commits. Include all changes with technical details. Format as markdown with sections for ## Features, ## Bug Fixes, ## Documentation, and ## Chores.

Commits:
[JSON structure with categorized commits]

Requirements:
- List all commits by category
- Include scope when available (e.g., **api**: description)
- Include commit hashes or PR numbers
- Highlight configuration changes with details
- Sort chronologically within each section
- Use technical language appropriate for developers
```

**Error Handling:**
- Retry logic for transient Bedrock API errors
- Fallback to template-based generation if Bedrock is unavailable
- Timeout handling (30 second max per request)

## Data Models

### RepositoryInfo
```typescript
interface RepositoryInfo {
  owner: string;
  repo: string;
  provider: 'github' | 'bitbucket'; // Extensible for future providers
}
```

### Commit
```typescript
interface Commit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  prNumber?: number;
}
```

### ParsedCommit
```typescript
interface ParsedCommit extends Commit {
  type: 'feat' | 'fix' | 'docs' | 'chore' | 'uncategorized';
  scope?: string;
  description: string;
  breakingChange: boolean;
}
```

### CategorizedCommits
```typescript
interface CategorizedCommits {
  features: ParsedCommit[];
  fixes: ParsedCommit[];
  docs: ParsedCommit[];
  chores: ParsedCommit[];
  uncategorized: ParsedCommit[];
}
```

### PullRequest
```typescript
interface PullRequest {
  number: number;
  title: string;
  mergedAt: Date;
  commits: Commit[];
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: GitHub URL validation
*For any* string input, the URL validator should accept only strings matching the GitHub repository URL format `https://github.com/{owner}/{repo}` and reject all other formats.
**Validates: Requirements 1.2**

### Property 2: Future date rejection
*For any* date input, the start date validator should reject dates that are in the future relative to the current date.
**Validates: Requirements 1.3**

### Property 3: Date range consistency
*For any* pair of dates (start, end), the validator should reject cases where the end date is before the start date.
**Validates: Requirements 1.4**

### Property 4: Incomplete form validation
*For any* form data with one or more required fields missing, the form submission should be prevented and validation errors should be displayed.
**Validates: Requirements 2.2**

### Property 5: Error message display
*For any* error response from the backend, the frontend should display an error message in a visible location.
**Validates: Requirements 2.5**

### Property 6: Repository URL parsing
*For any* valid GitHub repository URL, the parser should correctly extract the owner and repository name.
**Validates: Requirements 4.1**

### Property 7: Date range filtering
*For any* date range (start, end) and collection of commits/PRs, the fetcher should return only items with dates within the specified range (inclusive).
**Validates: Requirements 4.3, 4.4**

### Property 8: Provider selection
*For any* repository URL, the system should select the appropriate provider implementation based on the URL format.
**Validates: Requirements 5.2**

### Property 9: Conventional commit categorization
*For any* commit message, the parser should categorize it as "feat", "fix", "docs", "chore", or "uncategorized" based on its prefix, where messages starting with "feat:", "fix:", "docs:", or "chore:" are categorized accordingly, and all others are marked as uncategorized.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 10: Release notes prompt construction
*For any* set of categorized commits, the system should construct a Bedrock prompt that includes only "feat" and "fix" commits and excludes "docs" and "chore" commits.
**Validates: Requirements 7.1, 7.2, 7.4**

### Property 11: Markdown validity
*For any* output from Bedrock, the system should validate that the generated content is valid markdown before returning it to the frontend.
**Validates: Requirements 7.3, 8.3**

### Property 12: Commit data chronological ordering
*For any* set of commits sent to Bedrock, the commits should be sorted chronologically by date before being included in the prompt.
**Validates: Requirements 7.5**

### Property 13: Changelog prompt completeness
*For any* set of categorized commits, the system should construct a Bedrock prompt that includes all commits (features, fixes, docs, and chores) with their respective categories.
**Validates: Requirements 8.1, 8.2**

### Property 14: Reference data inclusion in prompt
*For any* commit sent to Bedrock, the commit data should include either a commit hash or pull request number that Bedrock can reference in the output.
**Validates: Requirements 8.4**

### Property 15: Configuration change detection
*For any* commit that includes configuration file changes (e.g., package.json, config files), the system should flag it in the data sent to Bedrock so configuration details can be highlighted.
**Validates: Requirements 8.5**

### Property 16: Invalid URL error handling
*For any* invalid repository URL, the backend should return a validation error message.
**Validates: Requirements 9.3**

## Error Handling

### Frontend Error Handling

**Validation Errors:**
- Display inline validation messages for form fields
- Prevent form submission until all validation passes
- Clear error messages when user corrects input

**API Errors:**
- Display error messages in a prominent alert/notification area
- Provide actionable guidance (e.g., "Check your access token" for auth errors)
- Allow users to retry after fixing issues

**Network Errors:**
- Detect network failures and display appropriate messages
- Implement timeout handling for long-running requests
- Provide retry mechanism

### Backend Error Handling

**GitHub API Errors:**
- Rate limiting: Return clear message about rate limits and when to retry
- Authentication failures: Return specific message about invalid or insufficient token permissions
- Repository not found: Return message indicating repository doesn't exist or is inaccessible
- Network errors: Return message about connectivity issues

**Validation Errors:**
- Invalid URL format: Return message with expected format
- Invalid date range: Return message explaining the constraint violation

**Unexpected Errors:**
- Log full error details (stack trace, context) for debugging
- Return generic error message to frontend to avoid exposing internal details
- Include error ID for correlation between frontend and backend logs

## Testing Strategy

### Unit Testing

The application will use **Jest** as the testing framework for both frontend and backend unit tests.

**Frontend Unit Tests:**
- Form validation logic (URL format, date validation)
- Component rendering (form fields, text areas, buttons)
- User interactions (button clicks, form submission)
- Clipboard copy functionality
- Error message display

**Backend Unit Tests:**
- URL parsing for different GitHub URL formats
- Commit message parsing and categorization
- Bedrock prompt construction for specific commit sets
- Bedrock response parsing and validation
- Error handling for specific error cases (including Bedrock API errors)
- Provider selection logic
- Fallback to template-based generation when Bedrock is unavailable

### Property-Based Testing

The application will use **fast-check** as the property-based testing library for JavaScript/TypeScript.

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the correctness property from this design document
- Tag format: `**Feature: release-notes-generator, Property {number}: {property_text}**`

**Property-Based Tests:**

Each correctness property listed in the Correctness Properties section will be implemented as a single property-based test:

1. **Property 1 Test**: Generate random strings (valid/invalid GitHub URLs) and verify validation
2. **Property 2 Test**: Generate random dates and verify future dates are rejected
3. **Property 3 Test**: Generate random date pairs and verify end-before-start validation
4. **Property 4 Test**: Generate random incomplete form data and verify submission prevention
5. **Property 5 Test**: Generate random error responses and verify error display
6. **Property 6 Test**: Generate random valid GitHub URLs and verify correct parsing
7. **Property 7 Test**: Generate random date ranges and commit/PR collections, verify filtering
8. **Property 8 Test**: Generate random repository URLs and verify correct provider selection
9. **Property 9 Test**: Generate random commit messages and verify categorization
10. **Property 10 Test**: Generate random commit sets and verify only feat/fix commits are in release notes prompt
11. **Property 11 Test**: Generate random Bedrock outputs and verify markdown validity
12. **Property 12 Test**: Generate random unordered commit sets and verify chronological sorting before sending to Bedrock
13. **Property 13 Test**: Generate random commit sets and verify all commits appear in changelog prompt
14. **Property 14 Test**: Generate random commits and verify references are included in prompt data
15. **Property 15 Test**: Generate commits with configuration file changes and verify they're flagged
16. **Property 16 Test**: Generate random invalid URLs and verify error messages

**Test Generators:**

Smart generators will be created to constrain inputs to valid ranges:
- GitHub URL generator: Produces valid GitHub URL formats with random owner/repo names
- Date generator: Produces dates within reasonable ranges (past 10 years to present)
- Commit message generator: Produces messages with and without conventional prefixes
- Commit set generator: Produces collections of commits with various types and dates

### Integration Testing

**API Integration Tests:**
- End-to-end flow from form submission to result display
- Backend API endpoint with mocked GitHub API responses
- Error scenarios (network failures, API errors, validation failures)

**GitHub API Integration:**
- Test with real GitHub API using a test repository (optional, for validation)
- Mock GitHub API responses for consistent testing

## Security Considerations

**Access Token Handling:**
- Frontend: Use password input type to mask token display
- Backend: Never log access tokens
- Backend: Pass tokens securely to GitHub API client
- Do not persist tokens in browser storage or backend database

**Input Validation:**
- Validate and sanitize all user inputs on both frontend and backend
- Prevent injection attacks through URL or date inputs
- Validate date formats to prevent malformed data

**API Security:**
- Implement rate limiting on backend API to prevent abuse
- Use CORS configuration to restrict frontend origins
- Validate all request payloads against expected schema

**Error Messages:**
- Avoid exposing internal system details in error messages
- Don't reveal whether a private repository exists (return generic auth error)
- Log detailed errors server-side only

## Performance Considerations

**Frontend:**
- Debounce form validation to avoid excessive validation calls
- Use loading states to provide feedback during long operations
- Implement request cancellation if user navigates away

**Backend:**
- Implement caching for GitHub API responses (with short TTL)
- Use pagination when fetching large numbers of commits/PRs
- Set reasonable timeouts for GitHub API requests
- Consider implementing request queuing for rate limit management

**GitHub API:**
- Minimize API calls by fetching only necessary data
- Use conditional requests (ETags) when possible
- Respect rate limits and implement exponential backoff for retries

## Deployment Considerations

**Frontend:**
- Build optimized production bundle
- Serve static assets via CDN
- Configure environment variables for backend API URL

**Backend:**
- Deploy as containerized application (Docker)
- Configure environment variables for port, CORS origins
- Set up logging and monitoring
- Implement health check endpoint

**Environment Variables:**
- `BACKEND_URL`: Backend API base URL (frontend)
- `PORT`: Server port (backend, default: 3001)
- `CORS_ORIGIN`: Allowed frontend origins (backend)
- `NODE_ENV`: Environment (development/production)
- `AWS_REGION`: AWS region for Bedrock (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS credentials for Bedrock access
- `AWS_SECRET_ACCESS_KEY`: AWS credentials for Bedrock access
- `BEDROCK_MODEL_ID`: Bedrock model identifier (default: anthropic.claude-3-haiku-20240307-v1:0)

**AWS Configuration:**
- Ensure AWS credentials have permissions for `bedrock:InvokeModel`
- Configure appropriate IAM role or access keys for Bedrock access
- Consider using AWS SDK credential chain for production (IAM roles, instance profiles)
