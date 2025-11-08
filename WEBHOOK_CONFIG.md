# ElevenLabs Webhook Configuration

## Your ngrok URL
```
https://1fdc6a207556.ngrok-free.app
```

## Complete Webhook URL for create_product Tool

Use this exact URL in your ElevenLabs agent custom tool configuration:

```
https://1fdc6a207556.ngrok-free.app/api/products/create
```

## How to Configure in ElevenLabs Dashboard

1. Go to https://elevenlabs.io/app/conversational-ai
2. Open your agent (ID: `agent_8401k9h8bmqpfk6a2d5ah18hdyvv`)
3. Go to **Tools** section
4. Find or create the `create_product` custom tool
5. Set the **Webhook URL** to:
   ```
   https://1fdc6a207556.ngrok-free.app/api/products/create
   ```

## Request Body Template

Make sure the request body template includes:

```json
{
  "name": "{{name}}",
  "price": {{price}},
  "quantity_unit": "{{quantity_unit}}",
  "description": "{{description}}",
  "user_id": "{{user_id}}"
}
```

## Important Notes

⚠️ **Keep ngrok running** while testing! If ngrok restarts, you'll get a new URL and need to update the webhook.

⚠️ **Free ngrok URLs expire** when you restart ngrok. If you restart ngrok:
1. Get the new URL from ngrok
2. Update `.env.local`
3. Update the webhook URL in ElevenLabs dashboard

## Testing the Webhook

Once configured, test it:

1. Start your app: `npm run dev`
2. Keep ngrok running: `ngrok http 3000`
3. Sign in to the marketplace
4. Click "Start Conversation"
5. Say: "I want to sell eggs for 2 dollars each"

The agent should:
1. Extract: name="eggs", price=2, quantity_unit="item"
2. Call: `https://1fdc6a207556.ngrok-free.app/api/products/create`
3. Product gets created in Supabase
4. Agent responds: "I've listed eggs at $2 per item for you"

## Checking if it Works

**Browser Console**:
- Should see: "Connected to ElevenLabs"
- No WebSocket errors

**ngrok Console**:
- Visit: http://127.0.0.1:4040
- See real-time webhook calls
- Inspect request/response data

**Supabase**:
- Go to Table Editor → products
- Should see your product after voice command

## Common Issues

### "Webhook failed" or "Timeout"
- Make sure ngrok is running
- Make sure your dev server is running (`npm run dev`)
- Check ngrok URL matches in ElevenLabs

### "User not authenticated"
- The webhook includes `user_id` from conversation variables
- Make sure you're signed in before starting conversation
- Check that `{{user_id}}` is in the request body template

### ngrok "Too many connections"
- Free ngrok has connection limits
- Consider upgrading ngrok or using a different tunnel service
- Restart ngrok to reset
