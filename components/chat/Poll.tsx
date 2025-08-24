'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface PollProps {
  question: string;
  options: PollOption[];
  onVote: (optionId: number) => void;
}

export function Poll({ question, options, onVote }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = (optionId: number) => {
    setSelectedOption(optionId);
    onVote(optionId);
  };

  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="p-4 bg-gray-700/50 rounded-lg my-2">
      <h3 className="font-bold text-white mb-3">{question}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => handleVote(option.id)}
                disabled={selectedOption !== null}
                className="w-full text-left p-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <div
                  className="absolute top-0 left-0 h-full bg-purple-500/50 rounded-md"
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="relative flex justify-between">
                  <span>{option.text}</span>
                  <span>{option.votes}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">Total Votes: {totalVotes}</p>
    </div>
  );
}
