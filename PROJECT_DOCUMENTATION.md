# AI Marketplace - Voice-First Local Marketplace Platform

## Overview

AI Marketplace connects local buyers and sellers through voice conversations with an AI agent. Users can list products, search for items, and get seller contact information simply by talking.

### What It Does

The AI agent helps users:
- List products for sale
- Search for products to buy
- Get seller contact information
- Manage product listings

## Technology Stack

- Frontend: Next.js 15 with React and TypeScript
- Database: Supabase (PostgreSQL)
- AI Voice: ElevenLabs Conversational AI
- Authentication: Supabase Auth

## Database Schema

### Profiles
User account information including name, email, and phone number.

### Products
Product listings with name, price, description, and meeting point for pickup.

## API Endpoints

### Profile Management

**Get Profile:** `GET /api/profile`
Returns user profile information (email, name, phone number).

**Update Profile:** `PATCH /api/profile/update`
Updates user phone number.

### Product Management

**Create Product:** `POST /api/products/create`
Creates a new product listing with name, price, description, and meeting point.

**Get My Products:** `GET /api/products/my-products`
Returns all products listed by the current user.

**Delete Product:** `DELETE /api/products/delete`
Removes a product listing (user must own the product).

**Search Products:** `POST /api/products/search`
Searches for products using keywords. Returns up to 5 matches with seller contact information.

### ElevenLabs Integration

**Get Signed URL:** `POST /api/elevenlabs/signed-url`
Generates a connection URL for the AI voice agent.

## How It Works

### Selling a Product

1. User says "I want to sell some apples"
2. Agent asks for details (price, description, meeting point)
3. Agent creates the product listing
4. Agent confirms the listing is live

### Buying a Product

1. User says "I'm looking for fresh apples"
2. Agent searches for matching products
3. Agent describes available products
4. User asks to contact a seller
5. Phone button appears on screen
6. User taps button to call the seller

## Client Tools

### display_phone_number

Shows a clickable phone button on screen with the seller's contact information. When tapped, opens the phone app to call the seller.

## Security

Row Level Security is enabled on all database tables:
- Users can only modify their own profile and products
- All product listings are publicly viewable
- The AI agent can act on behalf of authenticated users

## User Interface

### Main Pages

**Voice Interface**
Animated orb showing voice activity with tap-to-talk button.

**Profile Page**
View and edit user information (name, email, phone number).

**My Products Page**
Grid of product cards with delete functionality.

**Authentication**
Sign up and sign in forms.

The interface is mobile-optimized with responsive layouts and large touch targets.

## Development Setup

### Requirements

- Node.js 18 or higher
- Supabase account
- ElevenLabs account

### Environment Variables

Create a `.env.local` file with:
- Supabase URL and keys
- ElevenLabs agent ID and API key

### Database Setup

Run `supabase db reset` to set up the database schema.

## Agent Configuration

### Dynamic Variables
- `user_id`: Current user's ID
- `user_name`: User's first name

### Webhook Tools
1. `create_product`: Creates a product listing
2. `search_products`: Searches for products by keywords
3. `get_user_profile`: Gets user information
4. `update_user_profile`: Updates user phone number

### Client Tools
1. `display_phone_number`: Shows phone button on screen

## Key Features

- Voice-first interaction with AI agent
- Natural conversation interface
- Local meetup points for exchanges
- Direct seller contact via phone
- Smart keyword search
- Mobile-optimized design
- Secure authentication and data access

## Future Enhancements

- Image uploads
- Location-based search
- User ratings
- In-app messaging
- Product categories
- Saved searches
