# 🎨 Open Graph Image Guide

## What You Need
Create a **1200x630px** image for social media sharing (Facebook, Twitter, LinkedIn, etc.)

## Current Status
- ✅ Meta tags are configured to use: `https://beta.tsalin.ai/logo.png`
- ⚠️ Your current `/public/logo.png` might not be the right size

## Recommended Image Specs
- **Dimensions:** 1200x630px (Facebook/Twitter optimal)
- **Format:** PNG or JPG
- **File size:** < 1MB
- **Safe zone:** Keep important content within 1200x600px (avoid edges)

## Design Tips
1. **Include:**
   - Tsalin.ai logo
   - Tagline: "Монголын Цалингийн Ил Тод Платформ"
   - Key feature or value prop
   - Brand colors (#fbd433 yellow, #020202 black)

2. **Text:**
   - Large, readable font (minimum 60px)
   - High contrast
   - Avoid small details

3. **Branding:**
   - Use your brand colors
   - Keep it simple and clean
   - Mobile-friendly (will be viewed small)

## How to Create

### Option 1: Design Tool
Use Canva, Figma, or Photoshop:
1. Create 1200x630px canvas
2. Add your logo and text
3. Export as PNG
4. Save to `/public/og-image.png`

### Option 2: Use Existing Logo
If you want to use existing logo temporarily:
```bash
# Copy and rename your best logo
cp public/logo.png public/og-image.png
```

Then update `index.html`:
```html
<meta property="og:image" content="https://beta.tsalin.ai/og-image.png" />
```

## Testing Your Image

### Online Tools:
1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
4. **Open Graph Check:** https://opengraphcheck.com/

### Steps:
1. Deploy your site with new meta tags
2. Enter your URL: `https://beta.tsalin.ai`
3. Check image preview
4. Click "Scrape Again" if needed

## Example Template

Create an image with:
```
+----------------------------------------+
|                                        |
|     [Tsalin.ai Logo]                   |
|                                        |
|   Монголын Цалингийн                    |
|   Ил Тод Платформ                       |
|                                        |
|   🔍 Харьцуулах | 📊 Шинжлэх | ✓ Баталгаажуулах  |
|                                        |
|                     Powered by Lambda  |
+----------------------------------------+
```

## After Creating
1. Save image as `/public/og-image.png`
2. Update `index.html` meta tags (if changed)
3. Deploy
4. Test with Facebook Debugger
5. Share and check preview!

