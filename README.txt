RoutineHub
==========

RoutineHub combines daily routines, meals and dumbbell training in one responsive, offline-friendly app, with a shared dark-fantasy theme and a gentle quest XP system.

Files
-----
index.html       App shell and five-section navigation
routine.css      RoutineHub layout and components
routine-theme.css Shared dark-fantasy palette, typography and common components
routine.js       Routine, weekly summary, quest XP and combined backup features
meals.html       Meal plan, recipes, cooking flow, stock and meal backup
lift.html        Upper/lower workout plan, logging, progress and Lift backup
manifest.json    PWA metadata
sw.js            Offline app-shell cache
icon-192.png     PWA icon
icon-512.png     PWA icon

Preview locally
---------------
Open a terminal in this folder and run:

  py -m http.server 8000

Then visit http://localhost:8000 in a browser. The service worker and offline
cache work on localhost or when deployed over HTTPS; opening index.html directly
as a file does not enable those browser features.

Run the app runtime checks with:

  node --test tests/app-runtime.test.cjs

Data stays in this browser's local storage. Quest XP is stored inside the
existing RoutineHub record. The app keeps its existing storage keys: rt1
(RoutineHub), mp4 (Meals) and lift_redesign_v1 (Lift). Use RoutineHub's
Edit section for a combined export/restore, or each app's own backup controls.
