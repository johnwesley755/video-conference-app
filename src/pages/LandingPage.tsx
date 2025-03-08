import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary-900 mb-6">
          Connect Anywhere, Anytime
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-10">
          Seamless video conferencing for teams and individuals. High-quality calls, screen sharing, and more - all in your browser.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/login">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
          Why Choose Our Platform
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                  <path d="M15 10l-4 4l6 6l4-16l-18 7l4 2l2 6l3-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Meetings</h3>
              <p className="text-secondary-600">
                Start or join meetings with a single click. No downloads required.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                  <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                  <line x1="8" x2="16" y1="21" y2="21"></line>
                  <line x1="12" x2="12" y1="17" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Screen Sharing</h3>
              <p className="text-secondary-600">
                Share your screen with participants for better collaboration.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Calls</h3>
              <p className="text-secondary-600">
                End-to-end encryption ensures your meetings stay private.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16 bg-secondary-50">
        <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
          How It Works
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                1
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-secondary-600">
                Sign up for free and get access to all features. No credit card required.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                2
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-xl font-semibold mb-2">Start or Join a Meeting</h3>
              <p className="text-secondary-600">
                Create a new meeting or join an existing one with a meeting ID.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                3
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-xl font-semibold mb-2">Collaborate Seamlessly</h3>
              <p className="text-secondary-600">
                Enjoy HD video, crystal clear audio, and powerful collaboration tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-secondary-900 mb-6">
          Ready to get started?
        </h2>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-10">
          Join thousands of users who trust our platform for their video conferencing needs.
        </p>
        
        <Link to="/login">
          <Button size="lg" className="px-8">
            Sign In Now
          </Button>
        </Link>
        <div className="mt-4">
          <span className="text-secondary-600">Don't have an account? </span>
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Video Conference</h3>
              <p className="text-secondary-400">
                Connect with anyone, anywhere with our simple video conferencing solution.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-800 mt-12 pt-8 text-center text-secondary-400">
            <p>© {new Date().getFullYear()} Video Conference. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;