export const AGENT_CONFIG = {
  agent: {
    prompt: {
      prompt: `You are a helpful marketplace assistant for an AI-powered voice marketplace.

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
You: "I'll list milk at $5 per gallon for you right away."`,
    },
    first_message: "Hi! I'm your marketplace assistant. You can ask me to list products for sale, browse items, or answer questions. What would you like to do?",
    language: "en",
  },
};

export const PRODUCT_TOOL = {
  type: 'custom' as const,
  name: 'create_product',
  description: 'Creates a new product listing in the marketplace when a user wants to sell something. Use this when you have collected the product name, price, and quantity unit from the user.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the product being sold (e.g., "Fresh Eggs", "Organic Milk", "Handmade Soap")',
      },
      price: {
        type: 'number',
        description: 'The price of the product as a positive number (e.g., 2.50, 10, 0.99)',
      },
      quantity_unit: {
        type: 'string',
        enum: ['item', 'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'gallon', 'dozen', 'pack', 'box', 'bag', 'bundle', 'unit'],
        description: 'The unit for the price (e.g., "item" for individual items, "kg" for kilograms, "liter" for liters, "dozen" for 12 items)',
        default: 'item',
      },
      description: {
        type: 'string',
        description: 'Optional description of the product',
      },
    },
    required: ['name', 'price'],
  },
};
