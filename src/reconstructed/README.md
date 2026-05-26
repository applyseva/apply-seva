# Reconstructed Source

This folder contains readable source reconstructed from the production bundles in `assets/`.

What is safe here:
- Bundle files are untouched.
- Components are rewritten into maintainable JSX.
- Migration notes document where runtime dependencies still point to bundled modules.

Current scope:
- `pages/ServiceApplicationPage.jsx`
- supporting components in `components/`
- `routeMeta.js` for the routes visible in the main bundle

Important notes:
- Some shared app modules are still referenced from the existing built assets as bridge imports.
- `serviceDetails` is currently imported from the built data module because that dataset is very large.
- This is a reconstruction, not a byte-for-byte recovery of the original source tree.

Suggested next steps:
1. Reconstruct shared layout and navigation into `src/reconstructed/components/`
2. Move service data out of `assets/serviceDetails-DMCo3p3v.js` into a plain source file
3. Rebuild the home page and remaining routed pages one by one
4. Add a fresh Vite config and app entry once enough pages are migrated
