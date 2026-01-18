"use client";
import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/nextjs";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// --- API Functions ---
async function fetchSubscriptionStatus() {
  const response = await fetch("/api/profile/subscription-status");
  if (!response.ok) return null;
  return response.json();
}

async function updatePlan(newPlan: string) {
  const response = await fetch("/api/profile/change-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPlan }),
  });
  if (!response.ok) throw new Error("Failed to update plan");
  return response.json();
}

async function unsubscribe() {
  const response = await fetch("/api/profile/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to unsubscribe");
  return response.json();
}

export default function Profile() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false); // Controls the pop-up
  
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  // --- Queries & Mutations ---
  const {
    data: subscriptionData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscriptionStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: updatePlanMutation, isPending: isUpdatePlanPending } = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plan updated successfully!");
      setIsManageModalOpen(false); // Close modal on success
      setSelectedPlan("");
    },
    onError: () => {
      toast.error("Error updating plan. Please try again.");
    },
  });

  const { mutate: unsubscribeMutation, isPending: isUnsubscribePending } = useMutation({
    mutationFn: unsubscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Unsubscribed successfully.");
      router.push("/subscribe");
    },
    onError: () => {
      toast.error("Error unsubscribing. Please try again.");
    },
  });

  // --- Derived State ---
  const subscription = subscriptionData?.subscription;
  
  const currentPlan = subscription?.subscriptionTier
    ? availablePlans.find((plan) => plan.interval === subscription.subscriptionTier)
    : null;

  const isFreeTier = !subscription?.subscriptionActive;

  // --- Handlers ---
  function handleUpdatePlan() {
    if (selectedPlan) {
      updatePlanMutation(selectedPlan);
    }
  }

  function handleUnsubscribe() {
    if (confirm("Are you sure you want to cancel? You will lose access to premium features at the end of your billing period.")) {
      unsubscribeMutation();
    }
  }

  // --- Loading / Auth States ---
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#37375e] flex flex-col items-center justify-center gap-4 text-white">
        <Spinner className="w-8 h-8 text-[#fe875d] animate-spin" />
        <span className="font-medium">Loading profile...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#37375e] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <p className="text-[#37375e] font-bold text-lg mb-4">Please sign in to view your profile.</p>
          <Link href="/sign-in" className="text-[#fe875d] hover:underline">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#37375e] flex items-center justify-center p-4 md:p-8 font-sans">
      <Toaster position="top-center" />

      {/* --- Main Profile Card --- */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 relative z-10">
        
        {/* Header */}
        <div className="bg-[#356288] pt-10 pb-16 px-8 text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#aacfdd] rounded-full opacity-10 translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#fe875d] rounded-full opacity-10 -translate-x-10 translate-y-10"></div>
          <h1 className="text-2xl font-bold text-white relative z-10">Account Settings</h1>
        </div>

        {/* User Info */}
        <div className="px-8 pb-8 relative">
          <div className="relative -mt-12 mb-4 flex justify-center">
            <div className="p-1.5 bg-white rounded-full shadow-lg">
              {user.imageUrl ? (
                <Image src={user.imageUrl} alt="User Avatar" width={100} height={100} className="rounded-full object-cover border-2 border-[#aacfdd]" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {user.firstName?.[0] || "U"}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#37375e]">{user.firstName} {user.lastName}</h2>
            <p className="text-[#356288] font-medium opacity-80">{user.primaryEmailAddress?.emailAddress}</p>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#aacfdd]/40">
            <h3 className="text-sm font-bold text-[#37375e] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Current Plan</h3>

            {isLoading ? (
              <div className="flex items-center gap-3 py-4 text-[#356288]">
                <Spinner className="w-5 h-5 animate-spin" />
                <span>Loading subscription...</span>
              </div>
            ) : isError ? (
              <div className="text-red-500 py-2 text-sm">Unable to load subscription details.</div>
            ) : (
              <div className="space-y-6">
                
                {/* Plan Info */}
                <div className={`p-4 rounded-xl border-l-4 ${isFreeTier ? "bg-gray-50 border-gray-400" : "bg-blue-50 border-[#fe875d]"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Plan Type</p>
                      <p className={`text-lg font-bold ${isFreeTier ? "text-gray-700" : "text-[#356288]"}`}>
                        {isFreeTier ? "Free Starter" : currentPlan?.name || "Premium Plan"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isFreeTier ? "bg-gray-200 text-gray-600" : "bg-[#fe875d]/10 text-[#fe875d]"}`}>
                      {isFreeTier ? "FREE" : "PRO"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Billing</p>
                      <p className="text-[#37375e] font-semibold">
                        {isFreeTier ? "$0.00 / month" : `${currentPlan?.amount || 0} ${currentPlan?.currency || "$"} / ${currentPlan?.interval || "month"}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                {isFreeTier ? (
                  <Link href="/subscribe" className="block w-full text-center bg-[#fe875d] hover:bg-[#fe1100] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200">
                    Upgrade to Premium
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsManageModalOpen(true)} // Opens the modal
                    className="block w-full text-center bg-white border-2 border-[#aacfdd] text-[#356288] font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    Manage Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MANAGE SUBSCRIPTION MODAL --- */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#37375e]/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#356288] p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Subscription</h3>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* Option 1: Change Plan */}
              <div>
                <h4 className="text-[#37375e] font-bold text-sm uppercase tracking-wider mb-4">Change Plan</h4>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      defaultValue={currentPlan?.interval}
                      disabled={isUpdatePlanPending}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-[#aacfdd] text-[#37375e] py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fe875d]/20 focus:border-[#fe875d] transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select a New Plan</option>
                      {availablePlans.map((plan, key) => (
                        <option key={key} value={plan.interval}>
                          {plan.name} — ${plan.amount}/{plan.interval}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#356288]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePlan}
                    disabled={isUpdatePlanPending || !selectedPlan}
                    className="w-full bg-[#356288] text-white font-bold py-3 rounded-xl hover:bg-[#2d5475] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center gap-2"
                  >
                    {isUpdatePlanPending ? (
                      <><Spinner className="w-5 h-5 text-white animate-spin" /><span>Updating...</span></>
                    ) : "Save New Plan"}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200"></div>

              {/* Option 2: Danger Zone */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h4 className="text-red-800 font-bold text-sm uppercase tracking-wider mb-2">Danger Zone</h4>
                <p className="text-red-600 text-xs mb-4">
                  Unsubscribing will remove your access to premium features at the end of your current billing cycle.
                </p>
                <button
                  disabled={isUnsubscribePending}
                  onClick={handleUnsubscribe}
                  className="w-full bg-white border border-red-200 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 flex justify-center items-center gap-2"
                >
                  {isUnsubscribePending ? (
                     <><Spinner className="w-5 h-5 animate-spin" /><span>Processing...</span></>
                  ) : "Unsubscribe"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}