'use client';

import { useState } from 'react';

export default function TestOAuth() {
    const [authUrl, setAuthUrl] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const generateOAuthUrl = async () => {
        setLoading(true);
        setResult('Generating OAuth URL...');
        setStep(1);
        
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
                // Store code verifier and state in sessionStorage
                sessionStorage.setItem('oauth_code_verifier', data.codeVerifier);
                sessionStorage.setItem('oauth_state', data.state);
                
                setAuthUrl(data.authUrl);
                setResult('✅ OAuth URL generated successfully! Now click the authorization URL below to start the automated flow.');
                setStep(2);
            } else {
                setResult(`❌ Error: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating OAuth URL:', error);
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const checkAuthStatus = async () => {
        setResult('Checking authentication status...');
        try {
            const response = await fetch('/api/auth/callback/twitter');
            const data = await response.json();
            
            if (data.success) {
                setResult(`✅ SUCCESS! Access token obtained:\n\n${JSON.stringify(data, null, 2)}`);
                setStep(3);
                // Clear session storage
                sessionStorage.removeItem('oauth_code_verifier');
                sessionStorage.removeItem('oauth_state');
            } else {
                setResult(`❌ Authentication failed:\n\n${JSON.stringify(data, null, 2)}`);
            }
        } catch (error) {
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleAuthClick = () => {
        // Get stored code verifier and state
        const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
        const state = sessionStorage.getItem('oauth_state');
        
        if (!codeVerifier || !state) {
            setResult('❌ Error: No OAuth data found. Please generate OAuth URL first.');
            return;
        }

        // Create the authorization URL with code verifier and state as parameters
        const authUrlWithParams = `${authUrl}&code_verifier=${codeVerifier}&state=${state}`;
        
        // Open the authorization URL
        window.open(authUrlWithParams, '_blank');
        
        setResult('🔄 Authorization window opened. Complete the authorization and then check the status.');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Automated OAuth Test Page</h1>
            
            {/* Step Indicator */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Testing Steps:</h3>
                <div className="space-y-2 text-sm">
                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">1</span>
                        Generate OAuth URL
                    </div>
                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">2</span>
                        Complete X Authorization
                    </div>
                    <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">3</span>
                        Get Access Token
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <button 
                    onClick={generateOAuthUrl}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : 'Step 1: Generate OAuth URL'}
                </button>

                {authUrl && (
                    <div className="border p-4 rounded">
                        <h3 className="font-bold mb-2">Step 2: Authorization URL</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Click the button below to start the automated OAuth flow. The code verifier is stored securely.
                        </p>
                        <button 
                            onClick={handleAuthClick}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Start Authorization
                        </button>
                        
                        <div className="mt-4 p-3 bg-yellow-100 rounded">
                            <h4 className="font-bold text-yellow-800">What happens next:</h4>
                            <ol className="text-sm text-yellow-700 mt-2 space-y-1">
                                <li>1. Click "Start Authorization" above</li>
                                <li>2. Complete the X authorization in the new window</li>
                                <li>3. You&apos;ll be redirected back automatically</li>
                                <li>4. The code verifier is included in the URL automatically</li>
                                <li>5. Click "Check Auth Status" to get your access token!</li>
                            </ol>
                        </div>
                    </div>
                )}

                <button 
                    onClick={checkAuthStatus}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Step 3: Check Auth Status
                </button>

                {result && (
                    <div className="border p-4 rounded">
                        <h3 className="font-bold mb-2">Result:</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
                            {result}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 