import { useState, useEffect } from 'react';
import { mediaDevicesService } from '../services/webrtc/mediaDevices';

const Settings = () => {
  const [audioDevices, setAudioDevices] = useState<{ id: string; label: string }[]>([]);
  const [videoDevices, setVideoDevices] = useState<{ id: string; label: string }[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permissions first to get labeled devices
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
          .then(stream => {
            // Stop the stream immediately after getting permissions
            stream.getTracks().forEach(track => track.stop());
          });

        const audio = await mediaDevicesService.getAudioDevices();
        const video = await mediaDevicesService.getVideoDevices();
        
        setAudioDevices(audio);
        setVideoDevices(video);
        
        // Set default selected devices from localStorage or first available
        const savedSettings = localStorage.getItem('media-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setSelectedAudioDevice(settings.audioDeviceId || (audio.length > 0 ? audio[0].id : ''));
          setSelectedVideoDevice(settings.videoDeviceId || (video.length > 0 ? video[0].id : ''));
        } else {
          setSelectedAudioDevice(audio.length > 0 ? audio[0].id : '');
          setSelectedVideoDevice(video.length > 0 ? video[0].id : '');
        }
      } catch (err) {
        console.error('Error loading devices:', err);
        setError('Failed to access media devices. Please check your permissions.');
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('media-settings', JSON.stringify({
        audioDeviceId: selectedAudioDevice,
        videoDeviceId: selectedVideoDevice
      }));
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {message}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Media Settings</h2>
        
        <div className="mb-4">
          <label htmlFor="audioDevice" className="block text-sm font-medium text-secondary-700 mb-1">
            Microphone
          </label>
          <select
            id="audioDevice"
            className="input"
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
          >
            {audioDevices.length === 0 ? (
              <option value="">No microphones found</option>
            ) : (
              audioDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="videoDevice" className="block text-sm font-medium text-secondary-700 mb-1">
            Camera
          </label>
          <select
            id="videoDevice"
            className="input"
            value={selectedVideoDevice}
            onChange={(e) => setSelectedVideoDevice(e.target.value)}
          >
            {videoDevices.length === 0 ? (
              <option value="">No cameras found</option>
            ) : (
              videoDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))
            )}
          </select>
        </div>
        
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;