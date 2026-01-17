"use client"

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

type ApiResponse = {
    message: string;
    error?: string;
};

async function createProfileRequest(){
    console.log("📞 Calling /api/create-profile...");
    try {
        const response = await fetch('/api/create-profile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("📥 Response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ API error response:", errorData);
            throw new Error(errorData.error || `Failed to create profile: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ API success response:", data);
        return data as ApiResponse;
    } catch (error) {
        console.error("❌ Error in createProfileRequest:", error);
        throw error;
    }
}

export default function CreateProfile(){
        const {isLoaded, isSignedIn} = useUser();
        const router = useRouter();
    const {mutate, isPending} = useMutation<ApiResponse, Error>({
        mutationFn: createProfileRequest,
        onSuccess: (data) => {
            console.log("✅ Profile creation successful:", data.message);
            router.push("/subscribe");
        },
        onError: (error) => {
            console.error("❌ Profile creation failed:", error.message);
            // You might want to show a toast notification here
        },
    });

    useEffect(() => {
        console.log("🔄 CreateProfile useEffect triggered:", { isLoaded, isSignedIn, isPending });
        if(isLoaded && isSignedIn && !isPending){
            console.log("🚀 Calling mutate to create profile...");
            mutate();
        }
    }, [isLoaded, isSignedIn, isPending, mutate]);

    return <div> Processing sign in...</div>;
}