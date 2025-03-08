class MediaDevicesService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  async getLocalStream(forceNew = false): Promise<MediaStream> {
    try {
      // Return existing stream if available and not forcing new
      if (this.localStream && !forceNew) {
        return this.localStream;
      }

      console.log('Requesting media devices...');
      
      // First check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support media devices');
      }

      // Try to get both audio and video
      try {
        console.log('Requesting audio and video...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        console.log('Got stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
        this.localStream = stream;
        return stream;
      } catch (err) {
        console.warn('Could not get both audio and video:', err);
        
        // Try with just audio if video fails
        try {
          console.log('Trying audio only...');
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
          
          console.log('Got audio-only stream');
          this.localStream = audioStream;
          return audioStream;
        } catch (audioErr) {
          console.error('Failed to get audio:', audioErr);
          throw new Error('Could not access microphone. Please check your permissions.');
        }
      }
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  async getScreenShareStream(): Promise<MediaStream> {
    try {
      if (this.screenStream) {
        return this.screenStream;
      }

      // Check if browser supports getDisplayMedia
      if (!navigator.mediaDevices ||!navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Your browser does not support screen sharing');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.screenStream = stream;
      return stream;
    } catch (error) {
      console.error('Error getting screen share stream:', error);
      throw error;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  // Add the missing methods
  toggleAudio(enabled: boolean): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  toggleVideo(enabled: boolean): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  async switchAudioDevice(deviceId: string): Promise<MediaStream> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });

      // Replace the audio track in the existing stream
      if (this.localStream) {
        const oldAudioTrack = this.localStream.getAudioTracks()[0];
        if (oldAudioTrack) {
          this.localStream.removeTrack(oldAudioTrack);
          oldAudioTrack.stop();
        }

        const newAudioTrack = newStream.getAudioTracks()[0];
        this.localStream.addTrack(newAudioTrack);
        
        return this.localStream;
      }

      this.localStream = newStream;
      return newStream;
    } catch (error) {
      console.error('Error switching audio device:', error);
      throw error;
    }
  }

  async switchVideoDevice(deviceId: string): Promise<MediaStream> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: deviceId } }
      });

      // Replace the video track in the existing stream
      if (this.localStream) {
        const oldVideoTrack = this.localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          this.localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }

        const newVideoTrack = newStream.getVideoTracks()[0];
        this.localStream.addTrack(newVideoTrack);
        
        return this.localStream;
      }

      this.localStream = newStream;
      return newStream;
    } catch (error) {
      console.error('Error switching video device:', error);
      throw error;
    }
  }

  async getAudioDevices(): Promise<{ id: string; label: string }[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.substring(0, 5)}...`
        }));
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  async getVideoDevices(): Promise<{ id: string; label: string }[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `Camera ${device.deviceId.substring(0, 5)}...`
        }));
    } catch (error) {
      console.error('Error getting video devices:', error);
      return [];
    }
  }
}

export const mediaDevicesService = new MediaDevicesService();