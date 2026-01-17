"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type SubscriptionData = {
  hasProfile: boolean;
  subscriptionActive: boolean;
  subscriptionTier: string | null;
  stripeSubscriptionId: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchSubscriptionStatus(): Promise<SubscriptionData> {
  const response = await fetch("/api/check-subscription");
  if (!response.ok) {
    throw new Error("Failed to fetch subscription status");
  }
  return response.json();
}

export default function SubscriptionStatus() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: fetchSubscriptionStatus,
  });

  if (isLoading) {
    return <div className="p-4">Loading subscription status...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>
      
      {!data.hasProfile ? (
        <div className="text-gray-600">
          <p>Profile not found. Please create a profile first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.subscriptionActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {data.subscriptionActive ? "Active" : "Inactive"}
            </span>
          </div>

          {data.subscriptionTier && (
            <div className="flex justify-between">
              <span className="font-semibold">Plan:</span>
              <span className="text-gray-700 capitalize">{data.subscriptionTier}</span>
            </div>
          )}

          {data.stripeSubscriptionId && (
            <div className="flex justify-between">
              <span className="font-semibold">Subscription ID:</span>
              <span className="text-gray-600 text-xs font-mono">
                {data.stripeSubscriptionId.substring(0, 20)}...
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-semibold">Email:</span>
            <span className="text-gray-700">{data.email}</span>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => refetch()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
