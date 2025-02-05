import React from 'react';
import { ArrowUp } from 'lucide-react';
import _ from 'lodash';

const Suggestions = ({ onSuggestionClick }) => {
  // suggestions text
  const suggestions = {
    firstCard: ['O que defendem os partidos', 'sobre habitação?'],
    secondCard: ['Como se comparam as posições dos partidos', `quanto ao SNS?`],
    thirdCard: [
      'O que propõem os partidos',
      `para melhorar o salário dos portugueses?`,
    ],
    fourthCard: ['Quais as propostas de cada partido', `para a educação?`],
  };
  const debouncedClick = React.useCallback(
    _.debounce(onSuggestionClick, 500),
    []
  );
  return (
    <>
      <div className="hidden md:grid grid-cols-2 gap-1">
        {Object.values(suggestions).map((s, index) => (
          <div
            onClick={() => debouncedClick(s)}
            key={index}
            className="flex justify-between group items-center py-2 px-4 bg-transparent border-[1px] border-slate-300 rounded-xl hover:bg-slate-400/10 cursor-pointer"
          >
            <div className="flex flex-col w-full text-xs md:text-sm">
              <p className="font-medium">{s[0]}</p>
              <p className="text-black/60">{s[1]}</p>
            </div>
            <div className="bg-black text-white rounded-md hidden group-hover:block px-1 py-1">
              <ArrowUp size={12} />
            </div>
          </div>
        ))}
      </div>
      <div className="block md:hidden space-y-1">
        {Object.values(suggestions)
          .slice(0, 2)
          .map((s, index) => (
            <div
              onClick={() => onSuggestionClick(s)}
              key={index}
              className="flex justify-between group items-center py-2 px-4 bg-transparent border-[1px] border-slate-300 rounded-xl hover:bg-slate-400/10 cursor-pointer"
            >
              <div className="flex flex-col w-full text-xs md:text-sm">
                <p className="font-medium">{s[0]}</p>
                <p className="text-black/60">{s[1]}</p>
              </div>
              <div className="bg-black text-white rounded-md hidden group-hover:block px-1 py-1">
                <ArrowUp size={12} />
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Suggestions;
