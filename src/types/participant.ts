export interface Participant {
  id: string;
  displayName: string;
  email?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

export interface ParticipantWithStream extends Participant {
  stream: MediaStream;
}