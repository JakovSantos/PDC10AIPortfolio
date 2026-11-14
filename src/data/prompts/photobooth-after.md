# Build a Complete AUF CCS Honor Society Photobooth Web App

Act as a senior full-stack developer and build a complete, production-ready photobooth web application for the AUF CCS Honor Society. Work directly in the project files, run the application, test its functionality, and fix errors. Do not stop at a visual prototype or provide code snippets without implementing them.

## 1. Technology Stack

Use a beginner-friendly, maintainable stack:

- React, TypeScript, and Vite
- Tailwind CSS for styling
- Browser MediaDevices API for camera access
- HTML Canvas for image composition and PNG export
- `qrcode` for QR generation
- Supabase Storage for persistent photo hosting
- Vercel for deployment

Use compatible, maintained dependencies. If the project already has a working setup, inspect it before changing the architecture unnecessarily.

## 2. Branding and Theme

Build an original fantasy-adventure interface inspired by The Legend of Zelda.

Visual direction:
- Forest green, emerald, antique gold, ivory, and subtle teal.
- Enchanted forests, ancient ruins, magical particles, and rune-inspired details.
- Elegant typography, refined borders, and subtle transitions.
- A polished, university-appropriate appearance.

Do not use official Zelda logos, characters, screenshots, or copyrighted game artwork. Create original fantasy-inspired decorations.

### Official splash-screen logo

I will provide the official AUF CCS Honor Society logo as a project asset.

- Use the exact supplied logo on the splash screen.
- Replace any existing or placeholder logo with this asset.
- Preserve its original artwork, colors, transparency, and proportions.
- Do not recreate, recolor, stretch, crop, or distort it.
- If the file is missing, ask me to add it instead of inventing a substitute.

The splash screen must include the logo, a short welcome message, and a prominent Start button.

## 3. Exact Existing PNG Photobooth Frame

I will also provide the actual PNG photobooth frame.

Treat this file as the source of truth. Do not generate, redraw, redesign, or replace it.

- Inspect its dimensions, aspect ratio, transparency, and actual photo openings.
- Preserve the original artwork, colors, and proportions.
- Position captured photos correctly behind the frame's intended openings.
- Adapt the layout to the actual frame rather than assuming a particular arrangement.
- Never stretch or distort the frame.
- Use the same frame in the preview and exported image.
- Store the asset in the project and load it reliably.

If the asset cannot be located, stop and ask me to provide it. Do not silently substitute a placeholder.

## 4. Responsive Device Support

Support desktop computers, laptops, tablets, iPads, and mobile phones.

- Use responsive layouts and touch-friendly controls.
- Request camera permission appropriately.
- Prefer the front-facing camera on mobile when available.
- Handle permission denial, missing cameras, and initialization errors.
- Use HTTPS in production.
- Mirror the live preview if appropriate, but avoid accidentally reversing the final photos.
- Ensure the interface remains usable in portrait and landscape orientations.

## 5. Four-Photo Capture Flow

Every session must contain exactly four manually initiated photos.

Implement this flow:

1. Display the live camera preview.
2. The participant presses Capture.
3. Show a visible three-second countdown.
4. Capture one photo when the countdown finishes.
5. Display the captured photo in its designated position.
6. Wait for the participant to initiate the next shot.
7. Repeat until four photos are captured.
8. Show the completed composition preview.

Requirements:
- Never automatically capture all four photos in succession.
- Each shot requires a separate button press.
- Disable Capture during countdowns to prevent duplicate captures.
- Display progress such as "Photo 2 of 4".
- Allow an individual photo to be retaken without affecting the others.
- Provide Retake All and Start New Session actions.
- Prevent completion until all four photo positions contain valid images.
- Release camera streams when the camera experience ends.

## 6. Final Image Composition

Use Canvas or an equivalent browser-compatible approach to combine the four actual captured photos with the supplied PNG frame.

Requirements:
- Match the composition to the actual frame's openings.
- Maintain the correct aspect ratio.
- Crop photos appropriately without unnecessarily cutting off faces.
- Preserve the frame's proportions and transparency.
- Ensure the exported result matches the preview.
- Do not include interface elements, buttons, countdowns, or browser controls in the final image.
- Export a high-quality PNG at an appropriate resolution.
- Provide a working Download Photo button.

Use sensible error handling for Canvas export and image loading.

## 7. CRITICAL: Functional QR Code and Cross-Device Downloads

The QR code must be genuinely functional. **Anyone who scans it with a compatible phone must be able to open and download the actual completed photobooth image on their own device.**

Do not create a decorative QR code or encode a fake, local, temporary, or session-dependent URL.

### A. Upload the finished image

When the participant requests a QR code:

1. Generate the final PNG.
2. Convert it to a valid Blob or File.
3. Upload it to persistent Supabase Storage.
4. Wait for the upload to succeed.
5. Obtain the actual accessible HTTPS URL of the uploaded image or its dedicated public sharing page.
6. Generate the QR code using that exact URL.

Never encode:
- `blob:` URLs
- `localhost` or `127.0.0.1`
- Development-only URLs
- Placeholder links
- Links dependent on the original browser session
- Temporary URLs that may expire before participants download their photos

Do not report success before the image is uploaded and a valid destination URL is available.

### B. Public photo-sharing page

Implement a dedicated, responsive sharing page, for example `/photo/:id`, that displays the correct uploaded image.

The page must:
- Load the correct image from persistent storage using a valid identifier.
- Display a preview of the final photobooth image.
- Include a prominent Download Photo button.
- Allow anyone with the valid link to access and download the photo without signing in.
- Work on mobile and desktop browsers.
- Continue working after the original photobooth session ends and the page is refreshed.
- Show a clear error if the image cannot be found or loaded.

Use a reliable method for downloading the actual PNG. Do not rely solely on the HTML `download` attribute for a cross-origin image. Implement a suitable download endpoint or correctly configured storage download mechanism if needed.

The downloaded file must contain all four captured photos and the exact supplied frame, not a screenshot of the sharing page or a placeholder.

### C. QR code generation

Use the `qrcode` library or an equivalent reliable implementation.

- Encode the exact production sharing-page URL.
- Display a high-resolution, scannable QR code with adequate contrast and a quiet zone.
- Provide Download QR Code, Copy Link, and Open Photo actions.
- Ensure all three actions use the same URL encoded in the QR code.
- Show loading states while uploading and generating the code.
- Handle upload and QR-generation failures clearly.
- Allow retrying a failed upload without retaking the photos.

### D. Supabase configuration and security

Configure Supabase Storage for persistent photo hosting.

- Use an appropriate bucket and access policy for public link-based sharing.
- Do not expose a service-role key or privileged secret in browser code.
- Use appropriate client upload policies or a secure server-side function for privileged operations.
- Store secrets in environment variables.
- Avoid exposing a listing of all participants' photos.
- Use unique, unpredictable image identifiers.
- Do not collect unnecessary personal information.
- Explain that anyone with a public sharing link may be able to view or download that photo.
- Do not use expiring links unless their expiration is explicitly configured and long enough for participants to retrieve their photos.

Document all necessary Supabase setup and environment variables. Do not fabricate credentials or claim the service is connected before it is configured.

## 8. Result Screen

After all four photos are captured, show the final composition and these actions:

- Download Photo
- Retake Individual Photo
- Retake All Photos
- Generate QR Code
- Start New Session

After successful upload and QR generation, display the QR code and:

- Download QR Code
- Copy Link
- Open Photo

Include concise guidance: "Scan the QR code with your phone to view and download your photo."

Display this message only when the sharing URL is valid and the upload has succeeded.

## 9. Inactivity and Session Reset

Implement a configurable inactivity timeout of 60 seconds by default.

- Reset the timer on user interaction.
- Warn the participant before clearing an inactive session.
- Allow them to continue.
- Return to the splash screen if the timeout expires.
- Clear temporary captured photos between participants.
- Release camera resources.
- Do not automatically delete uploaded photos unless a documented retention policy requires it.
- Ensure the next participant cannot see the previous participant's temporary session.

## 10. Accessibility and Reliability

Implement:
- Loading and error states.
- Accessible labels and keyboard-friendly controls where practical.
- High-contrast text and touch-friendly buttons.
- Responsive image sizing.
- Camera, Canvas, upload, and QR-generation error handling.
- Protection against duplicate capture and upload submissions.
- Proper cleanup of camera streams and temporary resources.

Prioritize reliable functionality and performance over unnecessary animations.

## 11. Vercel Deployment

Prepare the application for deployment to Vercel.

- Ensure the production build succeeds.
- Configure client-side routing so direct routes and refreshes work.
- Use HTTPS in production.
- Ensure the camera works on the deployed domain.
- Configure environment variables correctly.
- Ensure sharing URLs use the real production domain, not a development address.
- Document the build and deployment process.
- Explain which external service settings I must configure manually.

Do not claim that the application is deployed unless deployment has actually been completed.

## 12. Mandatory Testing

Build and run the application, inspect errors, and fix issues before declaring completion.

Verify:

1. The splash screen uses the exact supplied official logo.
2. The supplied PNG frame is used without alteration.
3. All four photos require separate manual capture actions.
4. The countdown and retake features work.
5. The final PNG contains the four photos and the correct frame.
6. The PNG downloads successfully.
7. The image uploads to persistent storage.
8. The QR code encodes the real production sharing-page URL.
9. The sharing page loads the correct image.
10. The Download Photo button retrieves the actual PNG.
11. Copy Link and Open Photo use the same QR destination.
12. The sharing page still works after a refresh.
13. A separate phone can scan the QR code and download the image.
14. No privileged credentials are exposed.
15. The production build succeeds.

Test the complete flow on the deployed HTTPS application whenever deployment is available. If you cannot physically scan the code using a separate device, perform all other available tests and give me explicit instructions for the remaining manual test. Never claim a test succeeded if it was not performed.

## 13. Deliverables

Complete the actual project and provide:

- All application source files.
- The working four-photo photobooth.
- Integration of the exact supplied logo and frame.
- High-quality PNG composition and download.
- Persistent image hosting and working cross-device QR sharing.
- A public sharing page with a functional Download Photo button.
- Responsive styling and error handling.
- A README with setup instructions, environment variables, Supabase configuration, Vercel deployment, and QR testing steps.

### Final instruction

Start by inspecting the project folder and locating the supplied logo and PNG frame. Then implement the complete application, run it, test it, and fix errors. Work in manageable stages, preserve functioning code, and continue until the acceptance criteria are satisfied or a genuine external setup requirement prevents further progress.

**The highest priorities are the exact supplied assets and a QR code that allows another person to open and download the actual completed photo from their own device. A visually correct QR code without a working destination is a failed implementation.**
