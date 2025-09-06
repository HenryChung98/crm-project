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
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">CRMPro</h3>
              <p className="text-gray-400 mb-4">
                고객 관계 관리의 새로운 기준을 제시하는 AI 기반 CRM 솔루션
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">기능</a></li>
                <li><a href="#" className="hover:text-white transition-colors">가격</a></li>
                <li><a href="#" className="hover:text-white transition-colors">통합</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">도움말</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-white transition-colors">상태</a></li>
                <li><a href="#" className="hover:text-white transition-colors">보안</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">소개</a></li>
                <li><a href="#" className="hover:text-white transition-colors">블로그</a></li>
                <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
                <li><a href="#" className="hover:text-white transition-colors">연락처</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CRMPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </footer>
  );
}
