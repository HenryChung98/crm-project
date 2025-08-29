"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";

export default function TestPage() {
  const { user, supabase } = useAuth();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") ?? "";

  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*") // Assuming we need more than just 'id' now
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        setError(error);
      } else if (data) {
        setSubscriptionId(data.id);
        setEndsAt(data.ends_at); // Make sure the column name is correct
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user?.id, supabase]);

  return (
    <>
      <div>Test Page - Plan & Usage Management</div>
      {loading && <p>Loading subscription...</p>}
      {error && <p>Error: {error.message}</p>}
      {subscriptionId && <p>Subscription ID: {subscriptionId}</p>}
      {endsAt && <p>ends at: {new Date(endsAt).toISOString()}</p>}
      {new Date(endsAt!) < new Date() && <p className="text-red-500">expired</p>}
    </>
  );
}
