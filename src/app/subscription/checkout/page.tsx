"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { selectPlan } from "../plan-selection";
import { PlanName } from "@/types/database/plan";
import { updatePaymentStatus } from "../subscription-management";
import { useOwnOrganization } from "@/shared-hooks/client/useOwnOrganization";

// ui
import { showError, showSuccess } from "@/shared-utils/feedback";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function CheckoutPage() {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const plan = searchParams.get("plan") as PlanName;
  const userId = searchParams.get("userId");

  const { orgId, isLoading, error } = useOwnOrganization();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const planPrices = {
    basic: "$9.99",
    premium: "$19.99",
  };

  const handlePayment = async () => {
    if (!user || !supabase || !plan || !userId) {
      showError("Invalid payment information");
      return;
    }

    setLoading(true);

    try {
      // 실제로는 여기서 결제 처리 (Stripe, PayPal 등)
      // 지금은 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 결제 후 플랜 저장
      const result = await selectPlan(supabase, userId, plan);

      if (result.success) {
        await queryClient.invalidateQueries({
          queryKey: ["subscription"],
        });

        // 결제 성공 업데이트 실제로는 결제 성공했을때 실행되도록 수정해야 됨됨
        const { success, error } = await updatePaymentStatus(supabase, userId, "paid");

        if (!success) {
          console.error("Payment status update failed:", error);
          throw new Error(error || "Failed to update payment status");
        }

        showSuccess("Payment successful! Plan activated.");
        window.location.href = orgId ? `/orgs/${orgId}/dashboard` : "/orgs/create-organization";
      } else {
        showError("Payment processed but failed to activate plan");
      }
    } catch (error) {
      showError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!plan || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4">Invalid checkout session</h1>
          <Button onClick={() => router.replace("/subscription")}>Back to Plans</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 rounded-lg shadow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-text-secondary">You are subscribing to the {plan} plan</p>
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="flex justify-between items-center">
            <span className="capitalize">{plan} Plan</span>
            <span className="font-bold">{planPrices[plan as keyof typeof planPrices]}/month</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center font-bold">
            <span>Total</span>
            <span>{planPrices[plan as keyof typeof planPrices]}/month</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value as "card")}
                className="form-radio"
              />
              <span>💳 Credit/Debit Card</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value as "paypal")}
                className="form-radio"
              />
              <span>🟦 PayPal</span>
            </label>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === "card" && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handlePayment} disabled={loading} className="w-full">
            {loading
              ? "Processing Payment..."
              : `Pay ${planPrices[plan as keyof typeof planPrices]}/month`}
          </Button>
          <Button onClick={handleCancel} disabled={loading} variant="primary" className="w-full">
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your subscription will auto-renew monthly. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
