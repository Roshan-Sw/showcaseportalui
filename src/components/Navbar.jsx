"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">
            SPIDER
            <span className="text-teal-400">W</span>
            ORKS
          </Link>
        </div>
        <div className="space-x-4">
          <Link href="/websites" className="hover:text-gray-300">
            WEBSITES
          </Link>
          <Link href="/landing-pages" className="hover:text-gray-300">
            LANDING PAGES
          </Link>
          <Link href="/ad-films" className="hover:text-gray-300">
            AD FILMS
          </Link>
          <Link href="/reels" className="hover:text-gray-300">
            REELS
          </Link>
          <Link href="/corporate-videos" className="hover:text-gray-300">
            CORPORATE VIDEOS
          </Link>
          <Link href="/keyword-ranking" className="hover:text-gray-300">
            KEYWORD RANKING
          </Link>
        </div>
      </div>
    </nav>
  );
}
