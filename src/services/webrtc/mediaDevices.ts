class MediaDevicesService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  async getLocalStream(): Promise<MediaStream> {
    try {
      if (this.localStream) {
        return this.localStream;
      }

      // Get saved media settings from localStorage
      const savedSettings = localStorage.getItem('media-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // First check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioDevice = devices.some(device => device.kind === 'audioinput');
      const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
      
      // Get user media with audio and video based on available devices
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: hasAudioDevice ? (settings.audioDeviceId ? { deviceId: { exact: settings.audioDeviceId } } : true) : false,
        video: hasVideoDevice ? (settings.videoDeviceId ? { deviceId: { exact: settings.videoDeviceId } } : true) : false
      });
      
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      
      // Try fallback options if specific device failed
      try {
        console.log('Trying fallback with default devices...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        
        this.localStream = stream;
        return stream;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        
        // Last resort: try with just audio if video failed
        try {
          console.log('Trying audio only...');
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
          
          this.localStream = audioOnlyStream;
          return audioOnlyStream;
        } catch (audioOnlyError) {
          console.error('Audio only also failed:', audioOnlyError);
          throw new Error('Failed to access media devices. Please check your camera and microphone permissions.');
        }
      }
    }
  }
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  async getScreenShareStream(): Promise<MediaStream> {
    try {
      if (this.screenStream) {
        return this.screenStream;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      this.screenStream = stream;
      
      // Handle when user stops sharing screen
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
      
      return stream;
    } catch (error) {
      console.error('Error getting screen share stream:', error);
      throw new Error('Failed to share screen');
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async switchAudioDevice(deviceId: string): Promise<MediaStream> {
    try {
      if (!this.localStream) {
        throw new Error('No local stream available');
      }
      
      // Stop current audio tracks
      this.localStream.getAudioTracks().forEach(track => track.stop());
      
      // Get new audio stream
      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      
      // Replace audio track in local stream
      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      
      // Remove old audio tracks
      this.localStream.getAudioTracks().forEach(track => {
        this.localStream!.removeTrack(track);
      });
      
      // Add new audio track
      this.localStream.addTrack(newAudioTrack);
      
      // Update settings in localStorage
      const savedSettings = localStorage.getItem('media-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      localStorage.setItem('media-settings', JSON.stringify({
        ...settings,
        audioDeviceId: deviceId
      }));
      
      return this.localStream;
    } catch (error) {
      console.error('Error switching audio device:', error);
      throw new Error('Failed to switch audio device');
    }
  }

  async switchVideoDevice(deviceId: string): Promise<MediaStream> {
    try {
      if (!this.localStream) {
        throw new Error('No local stream available');
      }
      
      // Stop current video tracks
      this.localStream.getVideoTracks().forEach(track => track.stop());
      
      // Get new video stream
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      
      // Replace video track in local stream
      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      
      // Remove old video tracks
      this.localStream.getVideoTracks().forEach(track => {
        this.localStream!.removeTrack(track);
      });
      
      // Add new video track
      this.localStream.addTrack(newVideoTrack);
      
      // Update settings in localStorage
      const savedSettings = localStorage.getItem('media-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      localStorage.setItem('media-settings', JSON.stringify({
        ...settings,
        videoDeviceId: deviceId
      }));
      
      return this.localStream;
    } catch (error) {
      console.error('Error switching video device:', error);
      throw new Error('Failed to switch video device');
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

  async getAudioOutputDevices(): Promise<{ id: string; label: string }[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.substring(0, 5)}...`
        }));
    } catch (error) {
      console.error('Error getting audio output devices:', error);
      return [];
    }
  }
}

export const mediaDevicesService = new MediaDevicesService();