// business logic

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useViews = () => {
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
