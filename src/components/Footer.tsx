import Link from "next/link";

import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { FaPinterest } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa6";

export default function Footer() {
  const liStyle = "hover:opacity-50 duration-300";
  return (
    <footer className="p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-white text-black">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-10 p-3">
          <Link
            href="#"
            className={liStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook size={20} />
          </Link>
          <Link
            href="#"
            className={liStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={20} />
          </Link>
          <Link
            href="#"
            className={liStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter size={20} />
          </Link>
          <Link
            href="#"
            className={liStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaPinterest size={20} />
          </Link>
          <Link
            href="#"
            className={liStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube size={20} />
          </Link>
        </div>
        <div className="flex gap-3">
          <Link href="/" className={liStyle}>
            Home
          </Link>
          |
          <Link href="/aboutus" className={liStyle}>
            About Us
          </Link>
          |
          <Link href="/services" className={liStyle}>
            Services
          </Link>
          |
          <Link href="/works" className={liStyle}>
            Works
          </Link>
        </div>
        copyright ©2025; Designed by HENRY
      </div>
    </footer>
  );
}
