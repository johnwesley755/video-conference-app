import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';

const CreateMeeting = () => {
  const [meetingName, setMeetingName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate a unique meeting ID
      const meetingId = uuidv4().substring(0, 10);
      
      // In a real app, you would save this to your database
      // For now, we'll just navigate to the meeting
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Meeting</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleCreateMeeting}>
          <div className="mb-6">
            <label htmlFor="meetingName" className="block text-sm font-medium text-secondary-700 mb-1">
              Meeting Name (Optional)
            </label>
            <input
              id="meetingName"
              type="text"
              className="input"
              placeholder="My Meeting"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
            />
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
              disabled={isGenerating}
            >
              {isGenerating ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Quick Join</h2>
        <p className="text-secondary-600 mb-4">
          Have a meeting ID? Join directly without creating a new meeting.
        </p>
        <div className="flex">
          <input
            type="text"
            className="input mr-2"
            placeholder="Enter meeting ID"
            id="quickJoinId"
          />
          <button
            onClick={() => {
              const meetingId = (document.getElementById('quickJoinId') as HTMLInputElement).value;
              if (meetingId) {
                navigate(`/join/${meetingId}`);
              }
            }}
            className="btn btn-primary whitespace-nowrap"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;