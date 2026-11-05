# Raah — Pakistan, a Little Closer

An interactive Pakistan travel inspiration site with a 3D aircraft, destination imagery, route sketches, and motion details. It is a static website with no package installation or server dependency.

## Deploy on Cloudflare Pages

Connect this repository at **Workers & Pages → Create application → Pages → Import an existing Git repository**.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `dist` |
| Root directory | Repository root |

The `dist/index.html` file and its assets are committed. After Git integration is configured, pushes to `main` trigger production deployments. The site needs no environment variables.

## Local preview

Serve the `dist` directory with a static server, for example `python -m http.server 8000 --directory dist`, then open `http://localhost:8000`.

## Imagery

Destination visuals are AI interpretations based on credited Wikimedia Commons reference photographs. The in-page **Image credits** panel and `dist/assets/photo-credits.json` provide attribution and licensing links. The visuals should not be treated as documentary photographs. The aircraft is rendered live in 3D.
