// business logic

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useViews = () => {
  const [views, setViews] = useState<any[]>([]);
  const getViews = async () => {
    const { data, error } = await supabase.from("users").select("*");

    if (data) {
      setViews(data);
    }
  };
  return { views, setViews };
};
