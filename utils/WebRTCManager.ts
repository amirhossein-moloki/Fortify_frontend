export class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(
    private onTrack: (stream: MediaStream) => void,
    private onIceCandidate: (candidate: RTCIceCandidate) => void,
  ) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onTrack(this.remoteStream);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate(event.candidate);
      }
    };
  }

  public async getLocalStream(video: boolean, audio: boolean): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream!);
    });
    return this.localStream;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  public async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public close(): void {
    this.peerConnection.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }
}
