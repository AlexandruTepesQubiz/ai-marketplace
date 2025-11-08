# AI Marketplace - Voice-First Local Trading Platform

## Overview

AI Marketplace is a **voice-first platform** that connects local buyers and sellers through an AI-powered conversational agent. Users interact with the marketplace entirely through voice commands, making buying and selling as simple as having a conversation.

### Key Concept

Instead of browsing through listings and filling out forms, users simply **talk to an AI agent** that:
- Helps them list products for sale
- Searches for products they want to buy
- Provides seller contact information
- Manages their listings

## Technology Stack

- **Frontend:** Next.js 15 (React), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI Voice Agent:** ElevenLabs Conversational AI
- **Authentication:** Supabase Auth

---

## Database Schema

### Profiles Table

Stores user account information.

```sql
profiles (
  id: UUID (references auth.users)
  email: TEXT
  first_name: TEXT
  last_name: TEXT
  phone_number: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### Products Table

Stores product listings from sellers.

```sql
products (
  id: UUID
  name: TEXT
  price: NUMERIC(10,2)
  quantity_unit: ENUM (item, kg, g, lb, oz, liter, ml, gallon, dozen, pack, box, bag, bundle, unit)
  seller_id: UUID (references auth.users)
  description: TEXT
  meeting_point: TEXT (physical location for pickup/exchange)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

---

## API Endpoints

### Authentication & Profile Management

#### 1. **Sign Up**
- **Method:** Handled by Supabase Auth
- **What it does:** Creates a new user account
- **Required fields:**
  - Email
  - Password
  - First Name
  - Last Name
  - Phone Number
- **Process:** When a user signs up, a profile is automatically created via database trigger

#### 2. **Get User Profile**
- **Endpoint:** `GET /api/profile`
- **Auth:** Required (or provide `user_id` query param for agent access)
- **What it does:** Returns the logged-in user's profile information
- **Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Agent Access:** `GET /api/profile?user_id={user_id}` (uses service role client)

#### 3. **Update User Profile**
- **Endpoint:** `PATCH /api/profile/update`
- **Auth:** Required (or provide `user_id` in body for agent access)
- **What it does:** Updates user's phone number
- **Request Body:**
```json
{
  "phone_number": "+1234567890"
}
```
**Agent Access:** Include `user_id` in body to bypass authentication

---

### Product Management

#### 4. **Create Product**
- **Endpoint:** `POST /api/products/create`
- **Auth:** Required (or provide `user_id` in body for agent access)
- **What it does:** Lists a new product for sale
- **Request Body:**
```json
{
  "name": "Fresh Apples",
  "price": 5.99,
  "quantity_unit": "kg",
  "description": "Organic apples from local farm",
  "meeting_point": "Central Park, North Entrance"
}
```

**Agent Access:** Include `user_id` in body to create products on behalf of users

#### 5. **Get My Products**
- **Endpoint:** `GET /api/products/my-products`
- **Auth:** Required
- **What it does:** Returns all products listed by the logged-in user
- **Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Fresh Apples",
      "price": 5.99,
      "quantity_unit": "kg",
      "description": "Organic apples from local farm",
      "meeting_point": "Central Park, North Entrance",
      "seller_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### 6. **Delete Product**
- **Endpoint:** `DELETE /api/products/delete`
- **Auth:** Required
- **What it does:** Deletes a product listing (only if you own it)
- **Request Body:**
```json
{
  "product_id": "uuid"
}
```

#### 7. **Search Products**
- **Endpoint:** `POST /api/products/search`
- **Auth:** Not required (public access)
- **What it does:** Searches for products using fuzzy keyword matching across all fields
- **Request Body:**
```json
{
  "keywords": ["apple", "fresh", "organic"]
}
```
- **Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Fresh Apples",
      "price": 5.99,
      "quantity_unit": "kg",
      "description": "Organic apples from local farm",
      "meeting_point": "Central Park, North Entrance",
      "seller_id": "uuid",
      "seller": {
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**How it works:**
- Searches across: product name, description, meeting point, and quantity unit
- Scores matches: name (10 points), description/meeting point (5 points), unit (2 points)
- Returns top 5 best matches
- Includes seller contact information for each product

---

### ElevenLabs Integration

#### 8. **Get Signed URL**
- **Endpoint:** `POST /api/elevenlabs/signed-url`
- **Auth:** Required
- **What it does:** Generates a signed URL for ElevenLabs agent connection
- **Response:**
```json
{
  "signedUrl": "wss://...",
  "userId": "uuid",
  "userName": "John"
}
```

**Dynamic Variables Provided:**
- `user_id`: The authenticated user's ID
- `user_name`: The user's first name

---

## Voice Agent Workflow

### User Flow Example: Selling a Product

1. **User:** "I want to sell some apples"
2. **Agent:** Calls `/api/products/create` webhook with:
   - `user_id` (from dynamic variable)
   - Product details collected from conversation
3. **System:** Creates product listing in database
4. **Agent:** Confirms listing created

### User Flow Example: Buying a Product

1. **User:** "I'm looking for fresh apples"
2. **Agent:** Calls `/api/products/search` with keywords: `["fresh", "apples"]`
3. **System:** Returns top 5 matching products with seller details
4. **Agent:** Describes available products
5. **User:** "I want to contact the seller"
6. **Agent:** Calls client tool `display_phone_number` with:
   - `phone_number`: Seller's phone
   - `seller_name`: Seller's name
7. **UI:** Phone button appears on screen
8. **User:** Taps button → Opens phone dialer with number

---

## Client Tools

### display_phone_number

**Purpose:** Shows a clickable phone button on the user's screen

**Type:** Client-side tool (runs in browser)

**Parameters:**
- `phone_number` (string, required): The seller's phone number
- `seller_name` (string, optional): The seller's name

**What it does:**
1. Displays a prominent phone call button over the voice interface
2. Shows seller's name and phone number
3. When tapped, opens native phone app with number pre-filled
4. Returns confirmation to agent

**Agent Configuration:**
```json
{
  "name": "display_phone_number",
  "type": "client",
  "description": "Display a clickable phone number button on the user's screen",
  "parameters": {
    "phone_number": "string",
    "seller_name": "string"
  },
  "wait_for_response": true
}
```

---

## Security & Permissions

### Row Level Security (RLS)

All database tables have RLS enabled:

**Profiles:**
- Everyone can view profiles
- Users can only create/update their own profile

**Products:**
- Everyone can view products (public marketplace)
- Users can only create/update/delete their own products

### Service Role Access

Certain endpoints support "service role" access for the AI agent:
- Agent can bypass RLS when `user_id` is provided
- Used for: creating products, updating profiles, fetching user data
- Ensures agent can act on behalf of authenticated users

---

## User Interface

### Main Components

1. **Voice Interface**
   - Large animated orb showing voice activity
   - Tap-to-talk button (phone icon)
   - Connection status indicator
   - Client tool overlays (phone button)

2. **My Profile Page**
   - View: first name, last name, email, phone number
   - Edit: phone number
   - Account creation date

3. **My Products Page**
   - Grid of product cards
   - Each card shows: name, price, description, meeting point
   - Delete product with confirmation dialog

4. **Authentication**
   - Sign Up: First name, last name, email, phone, password
   - Sign In: Email, password

### Mobile-First Design

All UI components are fully responsive:
- Larger touch targets on mobile
- Simplified layouts on small screens
- Full-width buttons for easy tapping
- Optimized typography and spacing

---

## Development Setup

### Prerequisites

- Node.js 18+
- Supabase account
- ElevenLabs account

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_API_KEY=your_api_key
```

### Database Setup

Run the migration file to set up the database:

```bash
supabase db reset
```

This runs: `supabase/migrations/001_initial_setup.sql`

---

## Agent Configuration Guide

### Dynamic Variables

Configure these in your ElevenLabs agent:

- `user_id`: Passed from `/api/elevenlabs/signed-url`
- `user_name`: User's first name for personalization

### Server Tools (Webhooks)

Configure these webhook tools in your agent:

1. **create_product**
   - URL: `https://your-domain/api/products/create`
   - Method: POST
   - Parameters: `name`, `price`, `quantity_unit`, `description`, `meeting_point`, `user_id`

2. **search_products**
   - URL: `https://your-domain/api/products/search`
   - Method: POST
   - Parameters: `keywords` (array of strings)

3. **get_user_profile**
   - URL: `https://your-domain/api/profile?user_id={user_id}`
   - Method: GET

4. **update_user_profile**
   - URL: `https://your-domain/api/profile/update`
   - Method: PATCH
   - Parameters: `user_id`, `phone_number`

### Client Tools

1. **display_phone_number**
   - Type: Client
   - Wait for response: Yes
   - Parameters: `phone_number`, `seller_name`

---

## Key Features

✅ **Voice-First Interaction** - No typing or clicking required
✅ **Natural Conversations** - Talk to AI like a human assistant
✅ **Local Focus** - Meeting points for in-person exchanges
✅ **Seller Contact** - Direct phone access with one tap
✅ **Smart Search** - Fuzzy keyword matching across all fields
✅ **User Management** - Profile and product listing management
✅ **Mobile Optimized** - Works perfectly on phones
✅ **Secure** - Row-level security and authentication

---

## Future Enhancements

- Image uploads for products
- Location-based search
- User ratings and reviews
- In-app messaging
- Price negotiation through agent
- Product categories
- Saved searches
- Notification system

---

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
