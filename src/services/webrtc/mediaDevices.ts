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
      
      // Check for permissions first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Available devices:', devices);
      } catch (err) {
        console.warn('Error enumerating devices:', err);
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
      // @ts-ignore - TypeScript doesn't recognize getDisplayMedia on mediaDevices
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
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
  async getAudioDevices(): Promise<{ id: string; label: string }[]> {
    try {
      // Request permissions first to get labeled devices
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
      // Request permissions first to get labeled devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
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