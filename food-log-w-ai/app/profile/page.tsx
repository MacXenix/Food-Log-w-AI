import SubscriptionStatus from "@/components/subscription-status";

export default function Profile(){
    return (
        <div className="min-h-screen pt-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
                <SubscriptionStatus />
            </div>
        </div>
    );
}