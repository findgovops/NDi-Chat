"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const Agents = () => {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState('https://netdez.sharepoint.com/:u:/r/sites/MyNDiHumanResources/SiteAssets/Copilots/MyNDi%20Human%20Resources%20Agent.agent?csf=1&web=1&e=B9jqr5');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if we have an authenticated session with a token
    if (status === 'authenticated' && session?.accessToken) {
      setIsLoading(false);
      setErrorMessage('');
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setErrorMessage('Please sign in to access SharePoint content');
    }
  }, [session, status]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Attempt to navigate to the new URL
    setTimeout(() => setIsLoading(false), 500);
  };
  
  return (
    <div className="browser-container w-full">
      <div className="browser-toolbar p-2 bg-gray-100 border-b flex items-center">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <input 
            type="text" 
            className="url-bar flex-1 p-2 border rounded" 
            value={url} 
            onChange={handleUrlChange} 
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            Go
          </button>
        </form>
      </div>
      <div className="browser-content relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading SharePoint content...</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <div className="text-red-500 text-xl mb-4">⚠️ {errorMessage}</div>
              <p className="mb-4">SharePoint sites require authentication. Here are some suggestions:</p>
              <ol className="text-left list-decimal pl-6 space-y-2">
                <li>Ensure you're signed in to your Microsoft account in this application</li>
                <li>Try opening the SharePoint site in a new tab first to authenticate</li>
                <li>Some SharePoint sites may have restrictions that prevent embedding in iframes</li>
              </ol>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            title="Web Browser"
            width="100%"
            height="600px"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            className="border-0"
          />
        )}
      </div>
    </div>
  );
};

export default Agents;