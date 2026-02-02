# Instructions for Code Signing

## The "damaged" error happens because the app is not code-signed.

### Option 1: Tell users to run this command after download:
```bash
xattr -cr "/Applications/Family Expenses.app"
```

### Option 2: Get proper code signing (Requires Apple Developer Account - $99/year)

1. Enroll in Apple Developer Program: https://developer.apple.com/programs/
2. Create certificates in Xcode or developer.apple.com:
   - Developer ID Application certificate
   - Developer ID Installer certificate (for DMG)
3. Add secrets to GitHub repository settings:
   - APPLE_ID: Your Apple ID email
   - APPLE_ID_PASSWORD: App-specific password from appleid.apple.com
   - CSC_LINK: Base64 encoded .p12 certificate file
   - CSC_KEY_PASSWORD: Password for the .p12 file

4. The app will then be properly signed and notarized by Apple.

### Option 3: Distribute outside the Mac App Store (Self-signed)
Keep current setup and include instructions for users in README.
