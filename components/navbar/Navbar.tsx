import NavSearch from "./NavSearch";
import LinksDropdown from "./LinksDropdown";
import DarkMode from "./DarkMode";
import Logo from "./Logo";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

function Navbar() {
  const { userId } = auth();
  return (
    <nav className="border-b">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-4 py-4">
        <Logo />
        <NavSearch />
        <div className="flex gap-4 items-center">
          {userId && (
            <Link
              href="/rentals/create"
              className="hidden sm:flex items-center text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-full transition-all"
            >
              Become a Host
            </Link>
          )}
          <DarkMode />
          <LinksDropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
