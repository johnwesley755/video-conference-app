import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const JoinMeeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [name, setName] = useState('');
  const [camera, setCamera] = useState(true);
  const [microphone, setMicrophone] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingId) {
      return;
    }

    // Store preferences
    localStorage.setItem('meeting-preferences', JSON.stringify({
      camera,
      microphone,
      name
    }));

    // Navigate to the meeting room
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Join Meeting</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleJoinMeeting}>
          <div className="mb-4">
            <label htmlFor="meetingId" className="block text-sm font-medium text-secondary-700 mb-1">
              Meeting ID
            </label>
            <input
              id="meetingId"
              type="text"
              className="input bg-secondary-100"
              value={meetingId}
              readOnly
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="camera"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  checked={camera}
                  onChange={(e) => setCamera(e.target.checked)}
                />
                <label htmlFor="camera" className="ml-2 block text-sm text-secondary-700">
                  Turn on camera
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="microphone"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  checked={microphone}
                  onChange={(e) => setMicrophone(e.target.checked)}
                />
                <label htmlFor="microphone" className="ml-2 block text-sm text-secondary-700">
                  Turn on microphone
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name}
            >
              Join Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinMeeting;