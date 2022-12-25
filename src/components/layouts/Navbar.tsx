import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/api";
import { User } from "@supabase/supabase-js";
const Navbar = ({ user }: { user: User | null }) => {
  const [profileMenu, setProfileMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      navigate("/");
    }
  };
  return (
    <nav className="bg-gray-200 px-2 shadow sticky top-0 border-secondary w-full py-2.5 rounded z-20 mx-auto">
      <div className="flex flex-wrap items-center justify-between mx-auto">
        <div className="flex items-center md:order-2">
          <p className="text-black px-5">{user?.email}</p>
          <button
            onClick={() => setProfileMenu((current) => !current)}
            type="button"
            className="flex mr-3 text-sm bg-gray rounded-full md:mr-0 focus:ring-4 focus:ring-gray"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-8 h-8 rounded-full"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/340px-Default_pfp.svg.png?20220226140232"
              alt="user"
            />
          </button>
          {/* <!-- Dropdown menu --> */}
          <div
            className={`z-50 ${
              !profileMenu && "hidden"
            } my-4 text-base list-none bg-white divide-y relative divide-gray rounded shadow`}
            id="user-dropdown"
          >
            <div
              onClick={handleLogout}
              className="px-4 py-3 absolute bg-gray right-12 rounded flex items-center gap-2 text-orange"
            >
              <span className="text-lg">
                <BiLogOut />
              </span>
              <span className="text-sm font-medium truncate">Logout</span>
            </div>
          </div>
          <button
            data-collapse-toggle="mobile-menu-2"
            type="button"
            onClick={() => setMobileMenu((current) => !current)}
            className="inline-flex items-center p-2 ml-1 text-sm text-black rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray"
            aria-controls="mobile-menu-2"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between ${
            !mobileMenu && "hidden"
          } w-full md:flex md:w-auto md:order-1`}
          id="mobile-menu-2"
        >
          <ul className="flex flex-col p-4 mt-4 border border-gray rounded-lg bg-gray md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0">
            <li>
              <Link
                to="/"
                className="block py-2 pl-3 pr-4 text-black rounded md:bg-transparent md:text-black md:p-0"
                aria-current="page"
              >
                Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
