# How to Use Check-Subscription Endpoint

## Quick Access

### Method 1: Direct Browser Access
1. Make sure you're signed in to your app
2. Open your browser and go to:
   ```
   http://localhost:3000/api/check-subscription
   ```
   (Replace `localhost:3000` with your domain in production)

3. You'll see JSON response with your subscription status

### Method 2: Using cURL (Terminal)
```bash
# Make sure you're authenticated (cookies will be sent automatically)
curl http://localhost:3000/api/check-subscription
```

### Method 3: Using JavaScript/TypeScript

#### In a React Component:
```typescript
async function checkSubscription() {
  const response = await fetch('/api/check-subscription');
  const data = await response.json();
  console.log('Subscription Status:', data);
  return data;
}
```

#### Using React Query:
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["subscription"],
  queryFn: async () => {
    const res = await fetch("/api/check-subscription");
    return res.json();
  },
});
```

## Response Format

### Success Response (Profile Found):
```json
{
  "hasProfile": true,
  "subscriptionActive": true,
  "subscriptionTier": "month",
  "stripeSubscriptionId": "sub_1234567890",
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

### No Profile Found:
```json
{
  "message": "Profile not found",
  "hasProfile": false
}
```

### Not Authenticated:
```json
{
  "error": "User not authenticated"
}
```

## Using the SubscriptionStatus Component

I've created a ready-to-use component! Just import it:

```tsx
import SubscriptionStatus from "@/components/subscription-status";

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <SubscriptionStatus />
    </div>
  );
}
```

The component automatically:
- Fetches subscription status
- Shows loading state
- Displays subscription details
- Has a refresh button
- Handles errors gracefully

## Testing After Webhook

After completing a Stripe checkout:

1. **Check the endpoint**: Visit `/api/check-subscription`
2. **Verify status**: `subscriptionActive` should be `true`
3. **Check tier**: `subscriptionTier` should match your plan (week/month/year)
4. **Verify ID**: `stripeSubscriptionId` should contain a Stripe subscription ID

## Debugging

If subscription status isn't updating:

1. **Check webhook logs**: Look in your server terminal for webhook events
2. **Verify webhook received**: Check for `✅ Webhook received: checkout.session.completed`
3. **Check database**: Use the endpoint to see current database state
4. **Stripe Dashboard**: Verify webhook deliveries in Stripe Dashboard → Webhooks

## Example: Check Status in Console

Open browser console and run:
```javascript
fetch('/api/check-subscription')
  .then(r => r.json())
  .then(data => console.log('Subscription:', data));
```
