import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase/config";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

const JoinMeeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [name, setName] = useState("");
  const [camera, setCamera] = useState(true);
  const [microphone, setMicrophone] = useState(true);
  const [user, setUser] = useState(null);
  const [previewStream, setPreviewStream] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Get user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.displayName) {
        setName(currentUser.displayName);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle camera preview
  useEffect(() => {
    let stream = null;

    const setupPreview = async () => {
      try {
        if (camera) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: microphone,
          });
          setPreviewStream(stream);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setPreviewStream(null);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Could not access camera or microphone");
        setCamera(false);
      }
    };

    setupPreview();

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camera, microphone]);

  const handleJoinMeeting = (e) => {
    e.preventDefault();

    if (!meetingId) {
      toast.error("Meeting ID is required");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Store preferences
    localStorage.setItem(
      "meeting-preferences",
      JSON.stringify({
        camera,
        microphone,
        name,
      })
    );

    // Stop preview stream before navigating
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }

    // Navigate to the meeting room
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-secondary-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join Meeting
          </CardTitle>
          <CardDescription className="text-center">
            Configure your audio and video before joining
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {camera ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-secondary-200 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-secondary-600">
                    {name ? name.charAt(0).toUpperCase() : "G"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleJoinMeeting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                type="text"
                value={meetingId}
                readOnly
                className="bg-secondary-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="camera"
                    checked={camera}
                    onCheckedChange={setCamera}
                  />
                  <Label htmlFor="camera" className="cursor-pointer">
                    Camera
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="microphone"
                    checked={microphone}
                    onCheckedChange={setMicrophone}
                  />
                  <Label htmlFor="microphone" className="cursor-pointer">
                    Microphone
                  </Label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button onClick={handleJoinMeeting} disabled={!name.trim()}>
            Join Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinMeeting;
