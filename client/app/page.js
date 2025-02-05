'use client';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { FaPaperPlane, FaSpinner, FaArrowDown } from 'react-icons/fa';
import { FiUser, FiPlusCircle, FiRefreshCw } from 'react-icons/fi';

import CentralImage from '@/components/central-image';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import LogoTopOfPage from '@/public/fap_horizontal.png';
import LogoOnMessage from '@/public/fap_branco.png';

import Markdown from 'markdown-to-jsx';
import MarkdownTypewriter from '@/components/markdown-typewriter';

// Assistant writing await time
const WRITING_TIMEOUT = 5;
// Max characters for user input
const CHARACTERS_LIMIT = 200;

export default function Home() {
  // States
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]); // Conversation history
  const [loading, setLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isAssistantWriting, setIsAssistantWriting] = useState(false);

  // Error states (if an error message should be shown inside the assistant bubble)
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // Effects
  useEffect(() => {
    handleScroll();
  }, [isAssistantWriting]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auxiliaries
  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setShowScrollDown(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const isAtBottom =
      chatContainerRef.current.scrollHeight -
        chatContainerRef.current.scrollTop <=
      chatContainerRef.current.clientHeight + 10;
    setShowScrollDown(!isAtBottom);
  };

  const handleNewConversationClick = () => {
    if (!isAssistantWriting) {
      setMessages([]);
      setConversation([]);
      setLoading(false);
      setErrorOccurred(false);
      setErrorMessage('');
    } else {
      abortControllerRef.current.abort();
      setLoading(false);
      setErrorOccurred(false);
      setErrorMessage('');
    }
  };

  // The streaming version of answer handling:
  async function streamAnswer(body) {
    const response = await fetch(process.env.NEXT_PUBLIC_URL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortControllerRef.current.signal,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const decodedChunk = decoder.decode(value);
        console.log(decodedChunk);
        const jsonStrings = decodedChunk
          .split(/(?<=\})/g)
          .filter((s) => s.trim());

        for (const jsonStr of jsonStrings) {
          try {
            const parsed = JSON.parse(jsonStr);

            // Check for error in chunk
            if (parsed.status === 'error') {
              setErrorOccurred(true);
              const eMessage =
                parsed.answer ||
                'Oops, ocorreu um erro. Por favor, reinicie a conversa.';
              setErrorMessage(eMessage);
              setLoading(false);
              setIsAssistantWriting(false);

              setMessages((prev) => {
                const newArr = [...prev];
                const lastIndex = newArr.length - 1;
                if (newArr[lastIndex]?.role === 'assistant') {
                  newArr[lastIndex] = {
                    role: 'assistant',
                    content: eMessage,
                    isError: true,
                  };
                } else {
                  newArr.push({
                    role: 'assistant',
                    content: eMessage,
                    isError: true,
                  });
                }
                return newArr;
              });
              return;
            }

            // Update loading message if provided
            if (parsed.loading) {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const newArr = [...prev];
                const lastIndex = newArr.length - 1;
                if (newArr[lastIndex]?.role === 'assistant') {
                  newArr[lastIndex].content = parsed.loading;
                }
                return newArr;
              });
            }

            // Final answer provided
            if (parsed.answer) {
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const newArr = [...prev];
                const lastIndex = newArr.length - 1;
                if (newArr[lastIndex]?.role === 'assistant') {
                  newArr[lastIndex].content = parsed.answer;
                }
                return newArr;
              });
            }
          } catch (err) {
            console.log('Error processing chunk:', err);
            setErrorOccurred(true);
            setErrorMessage('Erro de conexão. Por favor, reinicie a conversa.');
            // Continue processing additional chunks if possible.
          }
        }
      }
    }
  }

  // Send message with streaming response
  async function handleSendMessage(input = userInput) {
    setUserInput('');
    if (input === '') return;

    // Clear previous error before sending
    setErrorOccurred(false);
    setErrorMessage('');

    // Prepare new user message.
    const newUserMessage = { role: 'user', content: input };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);

    // Add a placeholder assistant message while waiting for the streamed response.
    const placeholderMessage = {
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, newUserMessage, placeholderMessage]);

    setIsAssistantWriting(true);
    setLoading(true);

    // Prepare request body (including a random user ID here)
    const requestBody = {
      question: input,
      convo: updatedConversation,
      //user_id: crypto.randomUUID(),
    };

    try {
      await streamAnswer(requestBody);
      setIsAssistantWriting(false);

      // Once the answer finishes streaming, append it to the conversation history.
      setMessages((currentMessages) => {
        const lastMessage = currentMessages[currentMessages.length - 1] || {};
        setConversation((prevConvo) => [
          ...prevConvo,
          {
            role: 'assistant',
            content: lastMessage?.content || 'No answer.',
          },
        ]);
        return currentMessages;
      });
    } catch (err) {
      console.error('Streaming or network error:', err);
      setIsAssistantWriting(false);
      setErrorOccurred(true);
      const eMessage = 'Erro de conexão. Por favor, reinicie a conversa.';
      setErrorMessage(eMessage);
      setMessages((prev) => {
        const newArr = [...prev];
        const lastIndex = newArr.length - 1;
        if (newArr[lastIndex]?.role === 'assistant') {
          newArr[lastIndex] = {
            role: 'assistant',
            content: eMessage,
            isError: true,
          };
        } else {
          newArr.push({
            role: 'assistant',
            content: eMessage,
            isError: true,
          });
        }
        return newArr;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 mx-auto relative max-w-4xl py-4 px-4">
      {/* SCROLL BUTTON */}
      {messages.length > 0 && showScrollDown && !isAssistantWriting && (
        <button
          className="absolute left-1/2 -translate-x-1/2 bottom-32 mx-auto p-2 bg-black rounded-lg text-white hover:bg-black/80 hover:text-[#e71c24] cursor-pointer"
          onClick={scrollToBottom}
        >
          <FaArrowDown size={12} />
        </button>
      )}

      {/* NEW CONVERSATION */}
      <div className="flex gap-4 items-center pt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className=" "
                size="icon"
                variant="outline"
                onClick={handleNewConversationClick}
              >
                <FiPlusCircle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Nova Conversa</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <a href="https://fap.pt/" target="_blank" rel="noopener noreferrer">
          <Image
            src={LogoTopOfPage}
            alt="FAP logo"
            width={200}
            className="w-[110px]"
          />
        </a>
      </div>

      {/* CENTRAL IMAGE & MESSAGES  */}
      <div
        className="flex-1 w-full h-full overflow-auto hide-scrollbar"
        ref={chatContainerRef}
      >
        <div className="mx-auto h-full flex flex-col gap-4 ">
          {messages.length === 0 && (
            <>
              <div className="h-full flex items-center justify-center">
                <CentralImage />
              </div>
              {/*<Suggestions onSuggestionClick={handleSuggestionClick} />*/}
            </>
          )}
          {messages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-2">
              {/* WHO SEND MESSAGE */}
              <div className="flex items-center gap-2 pl-4">
                <p>
                  {msg.role === 'user' ? (
                    <FiUser />
                  ) : (
                    <Image
                      src={LogoOnMessage}
                      alt="Brácaro logo"
                      height={16}
                      width={16}
                    />
                  )}
                </p>
                <p className="text-sm font-bold">
                  {msg.role === 'user' ? 'You' : 'FAP Assistant'}
                </p>
              </div>
              {/* CONTENT */}
              <div
                className={`rounded-lg px-4 py-2 text-sm border whitespace-pre-wrap break-words ${
                  msg.role === 'assistant'
                    ? msg.isError
                      ? 'bg-red-100 text-red-800 border-red-300 relative'
                      : 'bg-gray-100'
                    : 'border-[#333333]'
                }`}
              >
                {msg.role === 'assistant' && msg.isError && (
                  <button
                    onClick={handleNewConversationClick}
                    className="absolute right-2 top-[50%] -translate-y-1/2 p-1 rounded-md hover:bg-red-200 transition-colors"
                    aria-label="Refresh conversation"
                  >
                    <FiRefreshCw className="h-3 w-3" />
                  </button>
                )}
                {msg.role === 'assistant' &&
                index === messages.length - 1 &&
                isAssistantWriting ? (
                  <MarkdownTypewriter
                    text={msg.content}
                    speedInMs={15}
                    isProcessing={isAssistantWriting}
                    onFinish={() => setIsAssistantWriting(false)}
                  />
                ) : msg.role === 'assistant' ? (
                  <Markdown
                    options={{
                      wrapper: 'div',
                      overrides: {
                        span: {
                          component: 'p',
                        },
                      },
                    }}
                    className="prose dark:prose-invert max-w-none text-sm"
                  >
                    {msg.content}
                  </Markdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* INPUT */}
      <div className="w-full">
        <div className="mx-auto">
          <div className="relative">
            <div className="flex items-center space-x-2 relative">
              <input
                type="text"
                value={userInput}
                maxLength={CHARACTERS_LIMIT}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSendMessage();
                    e.target.blur();
                  }
                }}
                className="flex-1 p-2 md:p-3 pl-3 md:pl-4 md:pr-[116px] pr-12 shadow-lg text-base border-2 font-primary border-[#000] rounded-xl focus:outline-none text-[#333333]"
                placeholder="Faça qualquer questão sobre a FAP..."
              />
              <div
                className={`absolute hidden ${
                  userInput.length === CHARACTERS_LIMIT
                    ? 'text-[#e71c24]'
                    : userInput.length
                    ? 'text-[#333333]'
                    : 'text-slate-300'
                } md:right-14 text-xs select-none md:block right-0`}
              >
                ({userInput.length}/200)
              </div>

              {loading ? (
                <button
                  className="absolute right-[10px] p-3 bg-black rounded-lg text-white disabled:opacity-50"
                  disabled
                >
                  <FaSpinner className="h-[10px] w-[10px] animate-spin" />
                </button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSendMessage()}
                        className="absolute right-[10px] p-3 rounded-lg bg-[#000] text-white hover:bg-black/80 hover:text-[#e71c24] disabled:opacity-50 disabled:bg-black disabled:text-[#e71c24]"
                        disabled={userInput === ''}
                      >
                        <FaPaperPlane className="h-[10px] w-[10px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Enviar Mensagem</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
