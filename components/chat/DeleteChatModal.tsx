import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DeleteChatModalProps {
  chatId: number;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteChatModal: React.FC<DeleteChatModalProps> = ({ chatId, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2D2A3D] p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Delete Chat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-300 mb-6">Are you sure you want to delete this chat? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="outline" className="bg-gray-700 text-white hover:bg-gray-600">
            Cancel
          </Button>
          <Button onClick={onDelete} variant="destructive" className="bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

