import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState('');
  const navigate = useNavigate();

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim()) {
      navigate(`/join/${meetingId.trim()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">Welcome to VideoMeet</h1>
        <p className="text-xl text-secondary-600">
          Connect with anyone, anywhere with high-quality video conferencing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Start a Meeting</h2>
          <p className="text-secondary-600 mb-6">
            Create a new meeting and invite others to join
          </p>
          <Link to="/create" className="btn btn-primary w-full">
            New Meeting
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Join a Meeting</h2>
          <p className="text-secondary-600 mb-4">
            Enter a meeting ID to join an existing meeting
          </p>
          <form onSubmit={handleJoinMeeting}>
            <div className="flex">
              <input
                type="text"
                className="input mr-2"
                placeholder="Meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap"
                disabled={!meetingId.trim()}
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>

      {user && (
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
          <div className="space-y-4">
            {/* This would typically be populated from your backend */}
            <p className="text-secondary-600 text-center py-4">
              Your recent meetings will appear here
            </p>
            <div className="text-center">
              <Link to="/history" className="text-primary-600 hover:text-primary-700">
                View all meeting history
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">HD Video</h3>
            <p className="text-sm text-secondary-600">
              Crystal clear video with adaptive quality
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Screen Sharing</h3>
            <p className="text-sm text-secondary-600">
              Share your screen with meeting participants
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-medium mb-2">Secure Meetings</h3>
            <p className="text-sm text-secondary-600">
              End-to-end encryption for all meetings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;