"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context";
import { signOutAction } from "@/lib/actions";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-md border-b border-base-300/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">

        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl font-bold normal-case px-2 hover:bg-transparent">
            IMP TEST
          </Link>
        </div>

        <div className="navbar-end flex items-center gap-4">
          {user ? (
            <>
              <Link href="/create" className="btn btn-ghost btn-sm normal-case">
                Create Post
              </Link>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:bg-base-200 focus:bg-base-200">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-9">
                      <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-32 border border-base-300/50" // Made it narrower
                >
                  <li>
                    <form action={signOutAction}>
                      <button type="submit" className="text-error w-full text-left">Sign Out</button>
                    </form>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn btn-ghost btn-sm normal-case">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm normal-case">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
