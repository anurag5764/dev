'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
    const searchParams = useSearchParams();
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                
                // Get code verifier from sessionStorage
                const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
                const storedState = sessionStorage.getItem('oauth_state');
                
                console.log('🔍 OAuth Callback Debug:');
                console.log('📝 Code:', code);
                console.log('🔗 State:', state);
                console.log('🔑 Code Verifier:', codeVerifier ? 'Present' : 'Missing');
                
                if (!code) {
                    setResult('❌ Error: No authorization code received');
                    setLoading(false);
                    return;
                }
                
                if (!codeVerifier) {
                    setResult('❌ Error: No code verifier found. Please restart the OAuth flow.');
                    setLoading(false);
                    return;
                }
                
                if (state !== storedState) {
                    setResult('❌ Error: State mismatch. Please restart the OAuth flow.');
                    setLoading(false);
                    return;
                }
                
                // Call our API with the code verifier
                const response = await fetch('/api/auth/callback/twitter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code,
                        state,
                        code_verifier: codeVerifier
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setResult(`✅ SUCCESS! Access token obtained:\n\n${JSON.stringify(data, null, 2)}`);
                    // Clear session storage
                    sessionStorage.removeItem('oauth_code_verifier');
                    sessionStorage.removeItem('oauth_state');
                } else {
                    setResult(`❌ Authentication failed:\n\n${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        
        handleCallback();
    }, [searchParams]);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">OAuth Callback</h1>
            
            {loading ? (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Processing OAuth callback...</p>
                </div>
            ) : (
                <div className="border p-4 rounded">
                    <h3 className="font-bold mb-2">Result:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
                        {result}
                    </pre>
                </div>
            )}
        </div>
    );
} 