# ElevenLabs Conversational AI Agent Setup

This guide will help you set up the ElevenLabs Conversational AI agent for voice-based product listing in the marketplace.

## Architecture Overview

**Backend-First Approach**:
- ✅ Tools are defined in the **ElevenLabs dashboard** (not client-side)
- ✅ ElevenLabs calls your **backend API endpoints** via webhooks
- ✅ No client-side transcription or tool handling
- ✅ User ID is passed automatically in conversation variables
- ✅ Secure and scalable

## What You'll Build

A voice-first marketplace where users can:
- **Talk naturally** with an AI assistant using continuous voice
- **List products for sale** by simply saying "I want to sell eggs for 2 USD each"
- **Specify quantity units** like "per kg", "per liter", "per dozen", etc.
- See a **ChatGPT-style voice bubble interface** while talking
- All processing happens on the **backend** via webhooks

## Prerequisites

- ElevenLabs API key (already configured)
- Supabase database (already configured)
- Products table migrated (see below)

## Step 1: Run the Products Table Migration

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your AI Marketplace project
3. Go to **SQL Editor** in the sidebar
4. Click **New query**
5. Copy the contents of `supabase/migrations/002_products_table.sql`
6. Paste and click **Run**

This creates:
- `products` table with fields: name, price, quantity_unit, seller_id, description
- Predefined quantity units (item, kg, g, lb, oz, liter, ml, gallon, dozen, pack, box, bag, bundle, unit)
- Row Level Security (RLS) policies
- Indexes for performance

## Step 2: Create an ElevenLabs Conversational AI Agent

1. Go to https://elevenlabs.io/app/conversational-ai
2. Click **Create New Agent**
3. Configure the agent:

### Basic Settings
- **Name**: Marketplace Assistant
- **Language**: English
- **Voice**: Choose a friendly, professional voice

### Conversation Config

#### System Prompt
```
You are a helpful marketplace assistant for an AI-powered voice marketplace.

Your role is to help users:
1. List products for sale by collecting: product name, price, and quantity unit (like "per item", "per kg", "per liter", etc.)
2. Browse and search for products
3. Answer questions about the marketplace

When a user wants to sell something:
- Ask for the product name if not provided
- Ask for the price if not provided
- Ask for the quantity unit if not clear (default to "item" if they just say a price)
- Once you have all information, use the create_product tool to list it

Be conversational, friendly, and concise. Confirm actions after completing them.

Example conversations:
User: "I want to sell eggs"
You: "Great! How much would you like to charge per dozen eggs?"
User: "2 dollars"
You: "Perfect! Let me list eggs at $2 per dozen for you."

User: "List milk for 5 dollars per gallon"
You: "I'll list milk at $5 per gallon for you right away."
```

#### First Message
```
Hi! I'm your marketplace assistant. You can ask me to list products for sale, browse items, or answer questions. What would you like to do?
```

### Step 3: Set Up ngrok for Local Development (Required)

Since ElevenLabs needs to call your backend via webhooks, you need to expose your local server:

1. Install ngrok: https://ngrok.com/download
2. Start your Next.js app:
   ```bash
   npm run dev
   ```
3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the **Forwarding URL** (looks like `https://abc123.ngrok.io`)

**Keep ngrok running** while testing!

### Step 4: Add Custom Tool for Product Creation

In the **Tools** section of your agent:

1. Click **Add Custom Tool**
2. Configure:

**Tool Name**: `create_product`

**Description**:
```
Creates a new product listing in the marketplace when a user wants to sell something. Use this when you have collected the product name, price, and quantity unit from the user. IMPORTANT: Always include {{user_id}} in the request body.
```

**Request Configuration**:
- **Method**: POST
- **URL**: `https://YOUR-NGROK-URL.ngrok.io/api/products/create`
  (Replace with your actual ngrok URL)

**Request Body Template** (JSON):
```json
{
  "name": "{{name}}",
  "price": {{price}},
  "quantity_unit": "{{quantity_unit}}",
  "description": "{{description}}",
  "user_id": "{{user_id}}"
}
```

**Parameters Schema** (JSON):
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the product being sold (e.g., \"Fresh Eggs\", \"Organic Milk\", \"Handmade Soap\")"
    },
    "price": {
      "type": "number",
      "description": "The price of the product as a positive number (e.g., 2.50, 10, 0.99)"
    },
    "quantity_unit": {
      "type": "string",
      "enum": ["item", "kg", "g", "lb", "oz", "liter", "ml", "gallon", "dozen", "pack", "box", "bag", "bundle", "unit"],
      "description": "The unit for the price (e.g., \"item\" for individual items, \"kg\" for kilograms, \"liter\" for liters, \"dozen\" for 12 items)",
      "default": "item"
    },
    "description": {
      "type": "string",
      "description": "Optional description of the product"
    }
  },
  "required": ["name", "price"]
}
```

**Important Notes**:
- The `{{user_id}}` variable is automatically passed from the frontend when the conversation starts
- Make sure to include it in the request body template
- The backend uses this to know which user is creating the product

3. Click **Save Tool**

## Step 5: Get Your Agent ID

1. After saving your agent, copy the **Agent ID** from the agent settings
2. It looks like: `agent_xxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 6: Update Environment Variables

Your `.env.local` should already have the agent ID (you added it earlier):

```env
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_8401k9h8bmqpfk6a2d5ah18hdyvv
```

If not, add it and restart your development server:
```bash
npm run dev
```

## Step 7: Test the Voice Interface

1. Open http://localhost:3000
2. Sign in to your account
3. You'll see a **large blue bubble** in the center (ChatGPT voice mode style)
4. Click **Start Conversation**
5. The assistant will greet you
6. Try saying:
   - "I want to sell eggs for 2 dollars each"
   - "List organic milk at 5 USD per gallon"
   - "I'm selling fresh tomatoes, 3 dollars per kg"

7. The agent will:
   - Extract the product name, price, and quantity unit
   - Call the API to create the product
   - Confirm the listing

## Quantity Units Supported

Users can say prices in any of these units:
- **item** - Individual items (default)
- **kg** / **kilogram** - Kilograms
- **g** / **gram** - Grams
- **lb** / **pound** - Pounds
- **oz** / **ounce** - Ounces
- **liter** / **litre** - Liters
- **ml** / **milliliter** - Milliliters
- **gallon** - Gallons
- **dozen** - 12 items
- **pack** - Package
- **box** - Box
- **bag** - Bag
- **bundle** - Bundle
- **unit** - Generic unit

## UI Features

### Voice Bubble Interface
- **Large blue circle** - Main voice interface (ChatGPT style)
- **Animated rings** - Pulse when the assistant is listening
- **Status indicators**:
  - "Ready to talk" - Not started
  - "Listening..." - Recording your voice
  - "Thinking..." - Processing/responding

### Conversation Transcript
- Shows below the bubble
- Displays both your messages and assistant responses
- Auto-scrolls with conversation

## Troubleshooting

### "WebSocket is already in CLOSING or CLOSED state"
**Solution**: This has been fixed! The app now uses signed URLs for authentication.
- Make sure both API keys are in `.env.local`:
  ```env
  ELEVENLABS_API_KEY=sk_your_key_here
  NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_your_id_here
  ```
- Restart your dev server: `npm run dev`
- The backend now handles authentication securely

### "Failed to start conversation"
- Check that your ElevenLabs Agent ID is correct in `.env.local`
- Verify your ELEVENLABS_API_KEY is correct
- Verify your agent is published and active in ElevenLabs dashboard
- Check browser console for detailed errors
- Make sure you're signed in

### "Failed to create product"
- Make sure you're signed in
- Verify the products table migration ran successfully
- Check that ngrok is running and the webhook URL is updated
- Check the browser console and server logs for errors

### Agent doesn't understand requests
- Refine the system prompt in ElevenLabs dashboard
- Add more example conversations to the prompt
- Test different phrasings
- Make sure the tool is properly configured

### Webhook not working (for local development)
- You need to expose your local server using ngrok:
  ```bash
  ngrok http 3000
  ```
- Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
- Update the webhook URL in ElevenLabs agent tool configuration
- Make sure to include `/api/products/create` in the URL
- Full URL should be: `https://abc123.ngrok.io/api/products/create`

### No audio / Microphone not working
- Grant microphone permissions in your browser
- Check browser console for permission errors
- Try refreshing the page and allowing permissions again
- Make sure no other app is using your microphone

## Next Steps

Now that voice-based product listing works, you can:
- Add product browsing/search via voice
- Implement voice-based purchasing
- Add product images and descriptions
- Create seller dashboards
- Add voice-based product discovery

## Example Conversations

**Listing a product:**
```
You: "I want to sell eggs"
Assistant: "Great! How much would you like to charge per dozen eggs?"
You: "2 dollars"
Assistant: "Perfect! Let me list eggs at $2 per dozen for you."
[Product created successfully]
```

**Listing with full details:**
```
You: "List organic honey for 15 dollars per jar"
Assistant: "I'll list organic honey at $15 per item for you right away."
[Product created successfully]
```

**Multiple products:**
```
You: "I'm selling tomatoes at 3 bucks per kg and cucumbers at 2 dollars per kg"
Assistant: "Let me help you list both of those..."
[Products created successfully]
```
