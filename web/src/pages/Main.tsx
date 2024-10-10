import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingMessages } from "@/lib/utils";
import Citation from "@/types/Citation";
import CitationResponse from "@/types/CitationResponse";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Main: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [citations, setCitations] = useState<Citation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [searchTime, setSearchTime] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  
    const FooterButtons: React.FC = () => (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</Link>
        <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</Link>
        <a href="https://github.com/rossheat/citesearch" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700">Open Source</a>
      </div>
    );
  
    useEffect(() => {
      checkServerHealth();
    }, []);
  
    const checkServerHealth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/health`);
        console.log('Server health check:', response.data);
      } catch (error) {
        console.error('Error checking server health:', error);
      }
    };
  
    useEffect(() => {
      if (isLoading) {
        const interval = setInterval(() => {
          setLoadingMessage(LoadingMessages[Math.floor(Math.random() * LoadingMessages.length)]);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [isLoading]);
  
    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setCitations([]);
      setHasSearched(true);
      setSearchTime(null);
    
      const startTime = performance.now();
    
      try {
        const response = await axios.post<CitationResponse>(`${import.meta.env.VITE_API_BASE_URL}/find-citations-for-passage`, {
          text: searchText
        }, { timeout: 300000 });
        setCitations(response.data.citations);
        const endTime = performance.now();
        setSearchTime((endTime - startTime) / 1000);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(`Error: ${err.response.data.detail || 'An unexpected error occurred'}`);
          } else if (err.request) {
            setError('No response received from the server. Please try again.');
          } else {
            setError('An error occurred while setting up the request. Please try again.');
          }
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleClear = () => {
      setSearchText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    };
  
    const CopyButton: React.FC<{ text: string }> = ({ text }) => {
      const [copied, setCopied] = useState(false);
  
      const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };
  
      return (
        <button onClick={handleCopy} className="ml-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none transition-colors duration-200">
          {copied ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      );
    };
  
    return (
      <div className="">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {citations.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-2 text-center">
                <span className="text-teal-600">Cite</span>
                <span className="text-purple-900">Search<sup className="text-[0.5em]">™️</sup></span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 text-center px-4">Find PubMed™️ citations that support your writing</p>
              <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 shadow-sm hover:shadow-md focus-within:shadow-md bg-white">
                  {searchText && (
                    <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 mr-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-grow outline-none resize-none overflow-hidden w-full text-gray-800"
                    placeholder="Enter a paragraph to find citations"
                    rows={1}
                    style={{ maxHeight: '10rem' }}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto';
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                    }}
                  />
                  {searchText && (
                    <button type="submit" className="ml-2">
                      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
              {hasSearched && citations.length === 0 && (
                <div className="mt-8 text-center">
                  <span className="text-6xl">🔍</span>
                  <p className="mt-4 text-xl text-gray-600">No results found. Try refining your search.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8">
              <div className="flex flex-col lg:flex-row items-center mb-2">
                <h1 className="text-3xl font-bold mb-4 lg:mb-0 lg:mr-8">
                  <span className="text-teal-600">Cite</span>
                  <span className="text-purple-900">Search<sup className="text-[0.5em]">™️</sup></span>
                </h1>
                <form onSubmit={handleSearch} className="w-full lg:flex-grow">
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 shadow-sm hover:shadow-md focus-within:shadow-md bg-white">
                    {searchText && (
                      <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 mr-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="flex-grow outline-none resize-none overflow-hidden w-full text-gray-800"
                      placeholder="Enter a paragraph to find citations"
                      rows={1}
                      style={{ maxHeight: '10rem' }}
                      onInput={(e) => {
                        e.currentTarget.style.height = 'auto';
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                    />
                    {searchText && (
                      <button type="submit" className="ml-2">
                        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </form>
              </div>
              {searchTime !== null && !isLoading && (
                <p className="text-sm text-gray-500 mt-2 mb-4 text-center">
                  Found {citations.length} result{citations.length !== 1 ? 's' : ''} in {searchTime.toFixed(2)} seconds
                </p>
              )}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
                  <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-t-teal-500 border-r-purple-900 border-b-teal-500 border-l-purple-900 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xl font-semibold mt-8 mb-2 text-gray-800">Searching for citations...</p>
                  <p className="text-lg text-gray-600 animate-pulse">{loadingMessage}</p>
                </div>
              ) : citations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
                  <span className="text-6xl">🔍</span>
                  <p className="mt-4 text-xl text-gray-600">No results found. Try refining your search.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {citations.map((citation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                      <h2 className="text-xl font-semibold mb-2 text-teal-700 hover:underline">
                        <a href={citation.pmc_link} target="_blank" rel="noopener noreferrer" className="cursor-pointer">{citation.title}</a>
                      </h2>
  
                      <div className="text-sm text-gray-600 mb-4 flex flex-wrap items-center">
                        {citation.doi ? (
                          <p className="mr-4">
                            <strong>DOI:</strong>{' '}
                            <a href={`https://doi.org/${citation.doi}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline break-all">
                              {citation.doi}
                            </a>
                          </p>
                        ) : (
                          <p className="mr-4"><strong>DOI:</strong> Not available</p>
                        )}
                        <p><strong>Published:</strong> {citation.publication_date}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-800">{citation.supporting_passage}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  strokeWidth={1.5} 
                                  stroke="currentColor" 
                                  className="w-6 h-6 text-gray-500 cursor-pointer inline ml-1"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" 
                                  />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-64 text-sm">
                                  This is a passage of text from the journal article that CiteSearch's AI determined supports the statements made in your search text and thus make this article a good citation.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </p>
                      </div>
  
                      <Accordion type="multiple" className="border-t border-gray-200">
                        <AccordionItem value="ai-reasoning">
                          <AccordionTrigger className="text-purple-900">
                            <div className="flex items-center space-x-1">
                              <span>🤖 AI reasoning</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      strokeWidth={1.5} 
                                      stroke="currentColor" 
                                      className="w-5 h-5 text-gray-500 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" 
                                      />
                                    </svg>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="w-64 text-sm">
                                      This is CiteSearch AI's reasoning why the journal article passage supports the statements made in your search text and thus makes this article a matching citation.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-800">{citation.reasoning}</p>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="citations">
                          <AccordionTrigger className="text-purple-900">
                            <div className="flex items-center space-x-1">
                              <span>🤝 Citations</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-5 h-5 text-gray-500 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                        />
                                      </svg>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-64 text-sm">
                                        Citations are provided in the Open University Harvard Cite Them Right™️ format.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm text-gray-800 space-y-4">
                                <h3 className="font-semibold mb-2">Reference list</h3>
                                <div className="flex items-center">
                                  <div className="flex-grow p-3 bg-gray-100 rounded-lg">{citation.reference_list_citation}</div>
                                  <CopyButton text={citation.reference_list_citation} />
                                </div>
    
                                <h3 className="font-semibold mb-2 mt-4">In-text</h3>
                                <div className="flex items-center">
                                  <div className="flex-grow p-3 bg-gray-100 rounded-lg">{citation.in_text_citation}</div>
                                  <CopyButton text={citation.in_text_citation} />
                                </div>
    
                                <p className="italic text-gray-500 mt-2">⚠ Citations are in Open University Harvard Cite Them Right™️ format</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {citations.length === 0 && (
              <FooterButtons/>
            )}
            {error && (
              <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      );
    };
   
export default Main