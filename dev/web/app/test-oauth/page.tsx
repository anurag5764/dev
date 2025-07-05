'use client';

import { useState } from 'react';

export default function TestOAuth() {
    const [authUrl, setAuthUrl] = useState('');
    const [codeVerifier, setCodeVerifier] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const generateOAuthUrl = async () => {
        setLoading(true);
        setResult('Generating OAuth URL...');
        
        try {
            console.log('Fetching OAuth URL...');
            const response = await fetch('/api/auth/twitter');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                setAuthUrl(data.authUrl);
                setCodeVerifier(data.codeVerifier);
                setResult('OAuth URL generated successfully!');
            } else {
                setResult(`Error: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating OAuth URL:', error);
            setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const testCallback = async () => {
        if (!codeVerifier) {
            setResult('Please generate OAuth URL first');
            return;
        }

        // Simulate the callback with a test code
        const testUrl = `/api/auth/callback/twitter?code=test_code&state=test_state&code_verifier=${codeVerifier}`;
        
        try {
            const response = await fetch(testUrl);
            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">OAuth Test Page</h1>
            
            <div className="space-y-4">
                <button 
                    onClick={generateOAuthUrl}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : 'Generate OAuth URL'}
                </button>

                {authUrl && (
                    <div className="border p-4 rounded">
                        <h3 className="font-bold mb-2">Authorization URL:</h3>
                        <a 
                            href={authUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all"
                        >
                            {authUrl}
                        </a>
                        
                        <h3 className="font-bold mt-4 mb-2">Code Verifier:</h3>
                        <code className="bg-gray-100 p-2 rounded block break-all">
                            {codeVerifier}
                        </code>
                    </div>
                )}

                <button 
                    onClick={testCallback}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Test Callback
                </button>

                {result && (
                    <div className="border p-4 rounded">
                        <h3 className="font-bold mb-2">Result:</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-auto">
                            {result}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 