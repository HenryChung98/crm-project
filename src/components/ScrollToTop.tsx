"use client";
import { useState, useEffect } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-50 bottom-20 right-3 
        text-foreground
        bg-background
        border-3
        border-foreground
        p-2 rounded-xl 
        shadow-lg 
        hover:opacity-50 
        transition-all duration-300 
        transform
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}
      `}
    >
      <IoIosArrowRoundUp size={30}/>
    </button>
  );
}
