# PWA Setup Complete! 🎉

Your Blockotchi game is now configured as a Progressive Web App. Users can install it on their phones!

## What's Already Configured

✅ Service Worker with auto-updates
✅ Offline support
✅ Solana RPC caching for better performance  
✅ Standalone app mode (no browser UI)
✅ Portrait orientation locked
✅ App manifest with proper metadata
✅ Mobile viewport and theme color

## Adding Your Icons

When you're ready to add icons, update the `icons` array in `vite.config.ts`:

```typescript
icons: [
  {
    src: "icon.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
],
```

### Recommended Icon Sizes
- **512x512** - Recommended for high-res devices

Optional extras (recommended):
- **192x192** - Better support across devices
- **Maskable 512x512** - For Android adaptive icons

Place your icon files in the `/public` folder.

## Testing Your PWA

### On Desktop (Chrome/Edge)
1. Build the app: `pnpm build`
2. Preview: `pnpm preview`
3. Open DevTools → Application → Manifest
4. Click "Install" icon in address bar

### On Mobile
1. Deploy your app to a hosting service (Vercel, Netlify, etc.)
2. Visit on Chrome (Android) or Safari (iOS)
3. Look for "Add to Home Screen" option
4. Install and enjoy!

## PWA Features Active

- **Auto-update**: App updates automatically when you deploy new versions
- **Offline Mode**: Core assets cached for offline use
- **Fast Loading**: Service worker caches resources
- **App-like Experience**: Runs in standalone mode without browser chrome
- **Solana Optimized**: RPC calls cached for 5 minutes to reduce latency

## Mobile Installation UX

Once icons are added, users will see:
- Android: "Add Blockotchi to Home screen" banner
- iOS: Share → "Add to Home Screen" option
- Desktop: Install icon in browser address bar

Your app will appear on users' home screens just like a native app!
