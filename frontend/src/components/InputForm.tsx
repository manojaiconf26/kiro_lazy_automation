import { useState, FormEvent } from 'react';

interface InputFormProps {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
}

export interface FormData {
  repositoryUrl: string;
  startDate: string;
  endDate: string;
  accessToken: string;
}

interface ValidationErrors {
  repositoryUrl?: string;
  startDate?: string;
  endDate?: string;
}

function InputForm({ onSubmit, loading }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    repositoryUrl: '',
    startDate: '',
    endDate: '',
    accessToken: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateGitHubUrl = (url: string): boolean => {
    if (!url) return false;
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const validateStartDate = (date: string): boolean => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return selectedDate <= today;
  };

  const validateEndDate = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate repository URL
    if (!formData.repositoryUrl) {
      newErrors.repositoryUrl = 'Repository URL is required';
    } else if (!validateGitHubUrl(formData.repositoryUrl)) {
      newErrors.repositoryUrl = 'Invalid GitHub URL format. Expected: https://github.com/{owner}/{repo}';
    }

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (!validateStartDate(formData.startDate)) {
      newErrors.startDate = 'Start date cannot be in the future';
    }

    // Validate end date
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (!validateEndDate(formData.startDate, formData.endDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div className="form-group">
        <label htmlFor="repositoryUrl">
          Repository URL <span className="required">*</span>
        </label>
        <input
          id="repositoryUrl"
          type="text"
          value={formData.repositoryUrl}
          onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={loading}
          className={errors.repositoryUrl ? 'error' : ''}
        />
        {errors.repositoryUrl && (
          <span className="error-message">{errors.repositoryUrl}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="startDate">
          Start Date <span className="required">*</span>
        </label>
        <input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          disabled={loading}
          className={errors.startDate ? 'error' : ''}
        />
        {errors.startDate && (
          <span className="error-message">{errors.startDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="endDate">
          End Date <span className="required">*</span>
        </label>
        <input
          id="endDate"
          type="date"
          value={formData.endDate}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          disabled={loading}
          className={errors.endDate ? 'error' : ''}
        />
        {errors.endDate && (
          <span className="error-message">{errors.endDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="accessToken">
          Access Token <span className="optional">(optional)</span>
        </label>
        <input
          id="accessToken"
          type="password"
          value={formData.accessToken}
          onChange={(e) => handleInputChange('accessToken', e.target.value)}
          placeholder="GitHub personal access token"
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className="generate-button">
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
}

export default InputForm;
