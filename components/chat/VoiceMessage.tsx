import { Play } from 'lucide-react';

interface VoiceMessageProps {
  duration: string;
}

export function VoiceMessage({ duration }: VoiceMessageProps) {
  return (
    <div className="flex items-center space-x-2">
      <button className="p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600">
        <Play className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-1 h-6">
        <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
        <div className="w-1 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
        <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
        <div className="w-1 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
      </div>
      <span className="text-sm text-gray-300">{duration}</span>
    </div>
  );
}
