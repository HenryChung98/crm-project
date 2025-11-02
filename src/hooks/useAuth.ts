import { AuthUserType } from "../types/authuser";
import { createClient } from "../utils/supabase/client";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
