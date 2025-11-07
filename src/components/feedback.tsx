import { toast } from "react-hot-toast";
import { MdInfoOutline } from "react-icons/md";

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "var(--popover)",
      color: "var(--success)",
      border: "1px solid var(--success)",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    iconTheme: {
      primary: "white",
      secondary: "var(--success)",
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "var(--popover)",
      color: "var(--danger)",
      border: "1px solid var(--danger)",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    iconTheme: {
      primary: "white",
      secondary: "var(--danger)",
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    icon: <MdInfoOutline className="bg-[var(--popover)] text-[var(--info)]" size={25} />,
    duration: 3000,
    style: {
      background: "var(--popover)",
      color: "var(--info)",
      border: "1px solid var(--info)",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
  });
};
