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
          <a href="/websites" className="hover:text-gray-300">
            WEBSITES
          </a>
          <a href="/landing-pages" className="hover:text-gray-300">
            LANDING PAGES
          </a>
          <a href="/ad-films" className="hover:text-gray-300">
            AD FILMS
          </a>
          <a href="/reels" className="hover:text-gray-300">
            REELS
          </a>
          <a href="/corporate-videos" className="hover:text-gray-300">
            CORPORATE VIDEOS
          </a>
          <a href="/keyword-ranking" className="hover:text-gray-300">
            KEYWORD RANKING
          </a>
        </div>
      </div>
    </nav>
  );
}
