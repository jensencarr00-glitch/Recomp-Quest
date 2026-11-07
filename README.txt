RoutineHub — single-file app

The complete RoutineHub, Meals and Lift application code is embedded in index.html. There are no app subfolders. The only additional root files are the PWA manifest, service worker and icons.

To deploy: upload the contents of this folder to the ROOT of your existing GitHub Pages repository, replacing the old app files. Keep index.html, manifest.json, sw.js and both icon files together at repository root. Commit and wait for GitHub Pages to deploy.

Meals and Lift are embedded directly in index.html as self-contained app views. Their own data remains stored in this browser's local storage.
