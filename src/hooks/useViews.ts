// business logic

import { useState } from "react";
import { useSupabase } from "./useSupabase";

export const useViews = () => {
  const { supabase } = useSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [views, setViews] = useState<any[]>([]);
  const getViews = async () => {
    const { data, error } = await supabase.from("users").select("*");

    if (data) {
      setViews(data);
    }
  };
  return { views, setViews };
};
