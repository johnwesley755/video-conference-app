import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 border-r border-secondary-100`}
    >
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-secondary-100">
          <h2 className="text-xl font-bold text-primary-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
              <path d="M23 7v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z"></path>
              <path d="M12 17v-6"></path>
              <path d="M8 13h8"></path>
            </svg>
            VideoMeet
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center px-4 py-3 rounded-md text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
              isActive('/') ? 'bg-primary-50 text-primary-700 font-medium' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          
          <Link
            to="/create"
            className={`flex items-center px-4 py-3 rounded-md text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
              isActive('/create') ? 'bg-primary-50 text-primary-700 font-medium' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M23 7v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z"></path>
              <path d="M12 17v-6"></path>
              <path d="M8 13h8"></path>
            </svg>
            Create Meeting
          </Link>
          
          <Link
            to="/history"
            className={`flex items-center px-4 py-3 rounded-md text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
              isActive('/history') ? 'bg-primary-50 text-primary-700 font-medium' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Meeting History
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center px-4 py-3 rounded-md text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors ${
              isActive('/settings') ? 'bg-primary-50 text-primary-700 font-medium' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings
          </Link>
        </nav>
        
        <div className="p-4 mt-auto border-t border-secondary-100">
          <div className="flex items-center justify-center">
            <p className="text-sm text-secondary-500">
              © {new Date().getFullYear()} VideoMeet
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;