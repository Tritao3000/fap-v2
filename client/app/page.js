'use client';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { FaPaperPlane, FaSpinner, FaArrowDown } from 'react-icons/fa';
import { FiUser, FiPlusCircle } from 'react-icons/fi';

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
  const [stopAssistantWriting, setStopAssistantWriting] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  // Effects
  useEffect(() => {
    handleScroll();
  }, [isAssistantWriting]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
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
    } else {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  // Send message handler
  async function handleSendMessage(input = userInput) {
    setUserInput('');
    if (input === '') return;

    // Prepare the new user message
    const newUserMessage = { role: 'user', content: input };

    // Update conversation and messages with the new user message
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setMessages([
      ...messages,
      newUserMessage,
      { role: 'assistant', content: 'Loading...' },
    ]);
    setLoading(true);

    // Prepare the request body
    const requestBody = {
      question: input,
      convo: updatedConversation, // Send the full conversation
    };
    console.log(requestBody, JSON.stringify(requestBody));

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the answer from the response

      const { answer } = await response.json();

      // Display the answer using the typewriter effect
      await displayAnswer(answer);

      // Update the conversation with the assistant's reply
      setConversation((prevConvo) => [
        ...prevConvo,
        { role: 'assistant', content: answer },
      ]);
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
      };
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Display the answer with a typewriter effect
  async function displayAnswer(answer) {
    setIsAssistantWriting(true);
    setMessages((prevMessages) => [
      ...prevMessages.slice(0, -1),
      {
        role: 'assistant',
        content: answer,
      },
    ]);
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

        <a href="https://www.fap.pt/" target="_blank" rel="noopener noreferrer">
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
                    <Image src={LogoOnMessage} alt="FAP logo" height={16} />
                  )}
                </p>
                <p className="text-sm font-bold">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </p>
              </div>
              {/* CONTENT */}
              <div
                className={`rounded-lg px-4 py-2 text-sm border whitespace-pre-wrap break-words ${
                  msg.role === 'assistant' ? 'bg-gray-100' : 'border-[#333333]'
                }`}
              >
                {msg.role === 'assistant' &&
                isAssistantWriting &&
                index === messages.length - 1 ? (
                  <MarkdownTypewriter
                    text={msg.content}
                    speedInMs={15}
                    isProcessing={isAssistantWriting}
                    onFinish={() => setIsAssistantWriting(false)}
                  />
                ) : (
                  <Markdown className="prose dark:prose-invert max-w-none text-sm">
                    {msg.content}
                  </Markdown>
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
                placeholder="Faça qualquer questão sobre a Federação Académica do Porto..."
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

              {loading && !stopAssistantWriting ? (
                <button
                  className="absolute right-[10px] p-3 bg-black rounded-lg text-white   disabled:opacity-50 "
                  disabled={loading}
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
