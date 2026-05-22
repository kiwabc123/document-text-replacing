# Aspose Words Integration Guide

Your invoice automation system is configured to use **Aspose Words** for superior DOCX-to-HTML conversion with full style preservation. Aspose is optional - the system works perfectly fine with **Mammoth.js** as fallback.

## Current Status

- ✅ **Mammoth.js**: Always available (default fallback)
- ⚠️ **Aspose Words**: Not installed (optional upgrade)

When Aspose is not installed, the system automatically uses Mammoth.js, which provides good style preservation for most cases.

## Installation Options

### Option 1: Aspose.Words for Node.js (NPM) - RECOMMENDED

**Best for:** Self-hosted deployments, maximum control

```bash
npm install @aspose/words
```

**Requirements:**
- License key (free 30-day trial available)
- Set license in your environment or code

**License setup:**
```typescript
// Add to your server startup code
const aw = require('@aspose/words');
aw.License().setLicense('path/to/license.lic');
```

**Get a free trial:**
1. Visit https://www.aspose.app/words/conversion/docx-to-html
2. Sign up for a free trial license
3. Download your license file
4. Place in your project or environment

**Pros:**
- No external API calls needed
- Best performance
- Full control
- Offline capability

**Cons:**
- Requires license (expensive for production)
- Free trial limited to 30 days

---

### Option 2: Aspose.Words Cloud API - GOOD FOR TESTING

**Best for:** Cloud deployments, serverless, free tier testing

```bash
npm install aspose-words-cloud
```

**Get free API credentials:**
1. Visit https://dashboard.aspose.cloud
2. Sign up for free account
3. Free tier: **100 API calls/month**
4. Create your API credentials

**Usage:**
```typescript
// In asposeConverter.ts (modify loadAspose function)
const api = new CloudApi.WordsApi({
  appSid: process.env.ASPOSE_APP_SID,
  appKey: process.env.ASPOSE_APP_KEY
});
```

**Pros:**
- Free tier available
- No license management
- Scalable

**Cons:**
- Requires internet connection
- Cloud dependency
- API rate limits

---

### Option 3: Keep Using Mammoth.js (Current Setup) ✅

**No installation needed** - Already working perfectly!

**Pros:**
- Zero configuration
- Offline
- Open source
- Good style preservation

**Cons:**
- Slightly less perfect styling than Aspose
- May miss some Word-specific formatting

---

## Performance Comparison

| Feature | Aspose (NPM) | Aspose (Cloud) | Mammoth.js |
|---------|------------|---|---|
| Installation | npm install | npm install | ✅ Built-in |
| Speed | ⚡ Fastest | ⚠️ Slower | ⚡ Fast |
| Cost | 💰 Paid | 💰 Pay-as-you-go | ✅ Free |
| Style Preservation | 🎯 Perfect | 🎯 Perfect | ✅ Good |
| License Required | ✅ Yes | ⚠️ API key | ❌ No |
| Offline | ✅ Yes | ❌ No | ✅ Yes |

---

## How Your System Works

The upload flow automatically handles both scenarios:

```
User uploads DOCX
    ↓
Check: Is Aspose installed?
    ├─→ YES: Use Aspose (superior styles)
    └─→ NO: Use Mammoth.js (good fallback)
    ↓
Convert DOCX → HTML (with styles embedded)
    ↓
Extract variables and parse content
    ↓
Generate PDF with proper styling
    ↓
Return to user
```

---

## Testing Aspose Installation

After installing Aspose, verify it works:

```bash
npm run build  # Rebuild to load Aspose
npm run dev    # Start dev server

# Upload a DOCX template in the UI
# Check console logs - should show:
# "📊 Using Aspose Words for HTML conversion"
```

---

## Recommendation

**For your current use case:**

- ✅ **Keep Mammoth.js (current setup)** if:
  - Style preservation is acceptable
  - You want zero additional setup
  - You want to avoid licensing costs
  - Offline operation is important

- 💡 **Consider Aspose** if:
  - You need pixel-perfect style preservation
  - Your Word templates have complex formatting
  - You have budget for licensing
  - You're in a corporate environment

---

## Troubleshooting

### I installed Aspose but it's still using Mammoth.js

1. Rebuild the project:
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

2. Check if Aspose module loads:
   ```bash
   node -e "require('@aspose/words')"
   ```

### License errors with Aspose

Make sure your license file path is correct:
```typescript
const aw = require('@aspose/words');
aw.License().setLicense(process.env.ASPOSE_LICENSE_PATH);
```

### Cloud API rate limits exceeded

Switch back to Mammoth.js or upgrade your Aspose Cloud plan.

---

## Next Steps

- **Status quo**: System works perfectly with Mammoth.js ✅
- **Upgrade**: Install Aspose for better styling
- **Questions**: Check Aspose documentation at https://docs.aspose.cloud/words/
