import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const Home = () => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState('');
  const [newMeetingId, setNewMeetingId] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const navigate = useNavigate();

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim()) {
      navigate(`/join/${meetingId.trim()}`);
    }
  };

  const generateMeetingId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setNewMeetingId(randomId);
    setShowShareDialog(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newMeetingId);
    toast.success("Meeting ID copied to clipboard", {
      description: "You can now share it with others",
    });
  };

  const joinNewMeeting = () => {
    navigate(`/meeting/${newMeetingId}`);
  };

  const shareOnSocialMedia = (platform: string) => {
    const meetingUrl = `${window.location.origin}/join/${newMeetingId}`;
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Join my video meeting!&url=${encodeURIComponent(meetingUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Join my video meeting: ${meetingUrl}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(meetingUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Shared on ${platform}`, {
      description: "Your meeting link has been shared",
    });
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
          <Button 
            onClick={generateMeetingId} 
            className="w-full"
            variant="default"
          >
            New Meeting
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Join a Meeting</h2>
          <p className="text-secondary-600 mb-4">
            Enter a meeting ID to join an existing meeting
          </p>
          <form onSubmit={handleJoinMeeting} className="flex gap-2">
            <Input
              type="text"
              placeholder="Meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!meetingId.trim()}
              variant="default"
            >
              Join
            </Button>
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

      {/* Share Meeting Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Meeting</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <p className="text-sm text-muted-foreground">
                Your meeting is ready. Share this meeting ID with others you want to invite.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={newMeetingId}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16V4a2 2 0 0 1 2-2h10" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Share on social media:</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="icon" onClick={() => shareOnSocialMedia('twitter')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" onClick={() => shareOnSocialMedia('facebook')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" onClick={() => shareOnSocialMedia('whatsapp')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Button>
              <Button variant="outline" size="icon" onClick={() => shareOnSocialMedia('linkedin')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="default" onClick={joinNewMeeting}>
              Join Meeting Now
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;