'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface CreatePollModalProps {
  onClose: () => void;
  onCreate: (question: string, options: string[]) => void;
}

export function CreatePollModal({ onClose, onCreate }: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (question.trim() && options.every(o => o.trim())) {
      onCreate(question, options);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2D2A3D] p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create a Poll</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question" className="text-white">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#1F1D2B] text-white"
              placeholder="What do you want to ask?"
            />
          </div>
          <div>
            <Label className="text-white">Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full bg-[#1F1D2B] text-white"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(index)} className="text-red-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <Button onClick={addOption} variant="outline" className="w-full mt-2">
              Add Option
            </Button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit}>Create Poll</Button>
        </div>
      </div>
    </div>
  );
}
