import { useState } from 'react';
import InputForm, { FormData } from './components/InputForm';
import ResultView from './components/ResultView';

interface Results {
  releaseNotes: string;
  changelog: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    // Clear previous results and errors
    setResults(null);
    setError(null);
    setLoading(true);

    try {
      // Make API request to backend
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl: formData.repositoryUrl,
          startDate: formData.startDate,
          endDate: formData.endDate,
          accessToken: formData.accessToken || undefined,
        }),
      });

      // Handle successful response
      if (response.ok) {
        const data: Results = await response.json();
        setResults(data);
      } else {
        // Handle error response
        const errorData: ErrorResponse = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error;
        setError(errorMessage);
      }
    } catch (err) {
      // Handle network errors or other exceptions
      console.error('Error generating release notes:', err);
      setError('Failed to connect to the server. Please ensure the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Release Notes Generator</h1>
      <InputForm onSubmit={handleFormSubmit} loading={loading} />
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Generating release notes...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message-container">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <ResultView 
          releaseNotes={results.releaseNotes} 
          changelog={results.changelog} 
        />
      )}
    </div>
  );
}

export default App;
