export interface Plan {
  name: string;
  amount: number;
  currency: string;
  interval: string;
  isPopular?: boolean;
  description: string;
  features: string[];
}

export const availablePlans: Plan[] = [
  {
    name: "Weekly Plan",
    amount: 9.99,
    currency: "$",
    interval: "week",
    description:
      "Great if you want to try the service before commiting longer.",
    features: [
      "Unlimited AI meal Plans",
      "AI Nutrition Insights",
      "Cancel Anytime",
    ],
  },
  {
    name: "Monthly Plan",
    amount: 39.99,
    currency: "$",
    interval: "month",
    isPopular: true,
    description:
      "Perfect for ongoing, month-to-month meal planning and features.",
    features: [
      "Unlimited AI meal Plans",
      "AI Nutrition Insights",
      "Priority AI support",
      "Cancel Anytime",
    ],
  },
  {
    name: "Yearly",
    amount: 159.99,
    currency: "$",
    interval: "year",
    description:
      "Best value for those commited to improving their diet long-term.",
    features: [
      "Unlimited AI meal Plans",
      "Smart Food Logging",
      "All premium features",
      "AI Nutrition Insights",
      "Priority AI support",
      "Cancel Anytime",
    ],
  },
];

const priceIDMap: Record<string, string> = {
  week: process.env.STRIPE_PRICE_WEEKLY!,
  month: process.env.STRIPE_PRICE_MONTHLY!,
  year: process.env.STRIPE_PRICE_YEARLY!,

}
export const getPriceIDFromType = (planType: string) => priceIDMap[planType];
