const Footer = () => {
  return (
    <footer className="bg-white border-t py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-secondary-500">
          &copy; {new Date().getFullYear()} VideoMeet. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;