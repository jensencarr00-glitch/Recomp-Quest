RoutineHub
==========

RoutineHub combines daily routines, meals and dumbbell training in one responsive, offline-friendly app.

Files
-----
index.html       App shell and five-section navigation
routine.css      Shared visual theme and responsive layout
routine.js       Routine, weekly summary and combined backup features
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

Data stays in this browser's local storage. The app keeps its existing storage
keys: rt1 (RoutineHub), mp4 (Meals) and lift_redesign_v1 (Lift). Use RoutineHub's
Edit section for a combined export/restore, or each app's own backup controls.
