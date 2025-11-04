import { useAuth } from "@/contexts/AuthContext";

export const UserProfile = () => {
  const { user } = useAuth();
  return (
    <div className="absolute top-4 left-4 right-4 p-3 bg-navbar-comp rounded-lg">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {user?.first_name?.charAt(0) || "U"}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-text-secondary">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
