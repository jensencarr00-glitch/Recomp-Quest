RECOMP QUEST — COMBINED APP

This combines the existing RoutineHub and Lift apps into one mobile-friendly website with a single navigation shell. The original app experiences are embedded as Daily Routine and Training sections, preserving their current features and the shared Recomp Quest local game key.

DEPLOY
1. Create a new GitHub repository (or use the repository you want to keep as the single app).
2. Upload index.html, manifest.json, sw.js, icon-192.png and icon-512.png to the repository root.
3. Enable GitHub Pages from Settings → Pages → Deploy from a branch → main → / (root).
4. Open the GitHub Pages URL.

IMPORTANT CURRENT LIMITATION
This combined build uses browser-local storage. It combines the apps on the same site/browser, but Google sign-in and cross-device cloud sync are NOT configured yet. Supabase still needs to be connected and configured before data will sync between devices. Do not put a Supabase service-role key in this website.

The two original app interfaces are preserved inside the combined shell. This is a first combined build; future refinements can make the subsections feel more native and remove duplicated inner navigation.
