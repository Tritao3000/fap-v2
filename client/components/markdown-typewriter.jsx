'use client';

import { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

export default function MarkdownTypewriter({
  text,
  speedInMs,
  onFinish,
  isProcessing,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [dots, setDots] = useState('');

  const words = text.split(' ');

  useEffect(() => {
    if (text === '') {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }

    if (currentWordIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) =>
          prev ? `${prev} ${words[currentWordIndex]}` : words[currentWordIndex]
        );
        setCurrentWordIndex((prev) => prev + 1);
      }, speedInMs);

      return () => clearTimeout(timeout);
    } else {
      // Call onFinish when all words have been displayed
      onFinish?.();
    }
  }, [currentWordIndex, words, speedInMs, onFinish, text]);

  if (text === '') {
    return (
      <div className="jumping-dots">
        <div>.</div>
        <div>.</div>
        <div>.</div>
      </div>
    );
  }

  return (
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
      {displayedText}
    </Markdown>
  );
}
