import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-secondary-900">Menu</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className="block px-4 py-2 rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
          >
            Home
          </Link>
          <Link
            to="/create"
            className="block px-4 py-2 rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
          >
            Create Meeting
          </Link>
          <Link
            to="/history"
            className="block px-4 py-2 rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
          >
            Meeting History
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
          >
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;