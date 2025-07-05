'use client';

import { useState } from 'react';

interface OAuthData {
  url: string;
  state: string;
}

export default function TestOAuth() {
  const [oauthData, setOauthData] = useState<OAuthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOAuthUrl = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/twitter/url');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setOauthData(data);
        console.log('OAuth URL generated:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    console.log('All cookies:', document.cookie);
    alert('Check browser console for cookie information');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={generateOAuthUrl}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate OAuth URL'}
        </button>
        
        <button
          onClick={checkCookies}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Check Cookies
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}
        
        {oauthData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold">OAuth URL Generated:</h3>
            <p className="mt-2">State: {oauthData.state}</p>
            <a
              href={oauthData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {oauthData.url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 