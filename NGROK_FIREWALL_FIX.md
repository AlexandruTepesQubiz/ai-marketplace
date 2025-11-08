# Ngrok Blocked by Corporate Firewall

## Problem

Your company's Fortinet firewall is blocking ngrok URLs because they're categorized as "Proxy Avoidance".

**Error Message:**
```
Category: Proxy Avoidance
URL: https://1fdc6a207556.ngrok-free.app/
```

## Solutions

### Option 1: Request Firewall Exception (Recommended for Development)

Contact your IT department and request they whitelist your ngrok URL:
- **URL to whitelist**: `https://1fdc6a207556.ngrok-free.app`
- **Reason**: Local development testing for hackathon project
- **Alternative**: Ask them to whitelist the entire `*.ngrok-free.app` domain temporarily

### Option 2: Use Your Local IP Address (If on Same Network)

If you're testing from the same network, use your local IP instead of ngrok:

1. **Find your local IP**:
   ```bash
   ipconfig
   ```
   Look for your IPv4 address (e.g., `172.17.40.73`)

2. **Update your webhook URL in ElevenLabs** to:
   ```
   http://172.17.40.73:3000/api/products/create
   ```

3. **Make sure your dev server allows external connections**:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

**Note**: This only works if ElevenLabs and your machine are on the same network (unlikely).

### Option 3: Use Alternative Tunneling Services

Try these alternatives to ngrok that might not be blocked:

#### A. **LocalTunnel**
```bash
npm install -g localtunnel
lt --port 3000
```
Then use the provided URL.

#### B. **Cloudflare Tunnel (cloudflared)**
1. Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Run:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

#### C. **Serveo** (SSH-based, might not be blocked)
```bash
ssh -R 80:localhost:3000 serveo.net
```

### Option 4: Deploy to a Cloud Service (Best for Production)

Deploy your API to a cloud service that won't be blocked:

#### **Vercel** (Recommended - Free & Easy)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Get your production URL (e.g., `https://your-app.vercel.app`)

4. Update webhook URL in ElevenLabs:
   ```
   https://your-app.vercel.app/api/products/create
   ```

**Benefits**:
- ✅ No firewall blocking
- ✅ HTTPS by default
- ✅ Fast deployment
- ✅ Free tier available
- ✅ Persistent URL (doesn't change)

#### **Railway** (Alternative)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 5: Test Locally Without Webhooks (For Now)

For development, you can test the product creation directly:

1. **Test the API endpoint locally**:
   ```bash
   curl -X POST http://localhost:3000/api/products/create \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Eggs","price":2,"quantity_unit":"dozen","user_id":"your-user-id-here"}'
   ```

2. **Use the browser to test** (temporarily modify for testing)

## Recommended Quick Solution

**For this hackathon, I recommend Option 4 (Vercel deployment)**:

### Quick Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy** (run from your project root):
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No
   - Project name: ai-marketplace
   - Directory: ./
   - Override settings: No

4. **Get your URL** (something like `https://ai-marketplace.vercel.app`)

5. **Update your .env.local on Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all your env variables:
     - `ELEVENLABS_API_KEY`
     - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_DB_PASSWORD`

6. **Update webhook URL in ElevenLabs**:
   ```
   https://ai-marketplace.vercel.app/api/products/create
   ```

7. **Redeploy** if needed:
   ```bash
   vercel --prod
   ```

## Testing

Once deployed, test the webhook:

```bash
curl -X POST https://ai-marketplace.vercel.app/api/products/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":10,"quantity_unit":"item","user_id":"test-123"}'
```

You should get a success response!

## Your Current Setup

- **Local IP**: 172.17.40.73 (from error message)
- **User**: QUBIZ\alexandru.tepes
- **Firewall**: Fortinet FortiGuard Web Filtering
- **Blocked URL**: https://1fdc6a207556.ngrok-free.app/

## Next Steps

1. Choose one of the options above
2. Update the webhook URL in your ElevenLabs agent
3. Test the integration
4. If Vercel deployment, your app will be publicly accessible and won't change URLs!
