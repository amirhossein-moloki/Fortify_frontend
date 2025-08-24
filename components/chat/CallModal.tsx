'use client'

import { Phone, Mic, MicOff, Video, VideoOff, X } from 'lucide-react'

interface CallModalProps {
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callStatus: 'incoming' | 'outgoing' | 'active';
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
}

export function CallModal({
  onClose,
  onAccept,
  onReject,
  onToggleMute,
  onToggleVideo,
  isMuted,
  isVideoEnabled,
  callStatus,
  remoteStream,
  localStream
}: CallModalProps) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#1F1D2B] p-6 rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col relative">
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black rounded-lg relative">
            {remoteStream ? (
              <video ref={video => { if (video) video.srcObject = remoteStream }} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                {callStatus === 'outgoing' ? 'Connecting...' : 'Waiting for user...'}
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">Remote</div>
          </div>
          <div className="bg-black rounded-lg relative">
            {localStream ? (
              <video ref={video => { if (video) video.srcObject = localStream }} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                Your camera is off
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">Local</div>
          </div>
        </div>

        <div className="mt-4 flex justify-center items-center space-x-4">
          <button onClick={onToggleMute} className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white`}>
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button onClick={onToggleVideo} className={`p-4 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-600'} text-white`}>
            {!isVideoEnabled ? <VideoOff /> : <Video />}
          </button>
          {callStatus === 'incoming' && (
            <button onClick={onAccept} className="p-4 rounded-full bg-green-500 text-white">
              <Phone />
            </button>
          )}
          <button onClick={onReject} className="p-4 rounded-full bg-red-500 text-white">
            <Phone className="transform rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
}
