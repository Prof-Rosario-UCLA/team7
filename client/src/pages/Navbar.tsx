import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-background text-text px-6 py-4 shadow-md">
      <ul className="flex items-center justify-between max-w-5xl mx-auto">
        <li className="text-lg font-semibold">
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>

        <li>
          <Link
            to="/report"
            className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-secondary transition"
          >
            + Make a report!
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
