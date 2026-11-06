# Project Structure Guide

This guide explains where the important parts of the application live and what each one does.

## Repository map

```text
DIP-Image-Compression/
├── api/
│   └── index.py
├── assets/
├── backend/
│   ├── __init__.py
│   └── main.py
├── docs/
│   ├── API.md
│   └── PROJECT_STRUCTURE.md
├── 404.html
├── app.js
├── index.html
├── offline.html
├── service-worker.js
├── styles.css
├── technique.html
├── upload.html
├── requirements.txt
├── vercel.json
└── README.md
```

## Folders

### `api/` — Vercel entry point

`index.py` exposes the FastAPI application to Vercel. It imports the app from `backend/main.py`. Keep this file in place unless the deployment configuration is deliberately changed.

### `backend/` — Python application

`main.py` creates the FastAPI app. It validates uploaded images, runs DCT/DWT/SVD compression and motion-blur restoration, calculates metrics, and serves frontend pages and generated results. `__init__.py` marks the directory as a Python package.

### `assets/` — Website images

Contains images used by the homepage and technique content. Keep referenced filenames stable unless the corresponding HTML is updated too.

### `docs/` — Developer documentation

- `API.md` describes endpoints, input fields, responses, and common errors.
- `PROJECT_STRUCTURE.md` explains the repository layout.

## Important root files

| File | Responsibility |
|---|---|
| `index.html` | Public homepage |
| `motion-blur.html` | Motion blur restoration interface |
| `motion-blur.js` | Motion blur UI and API requests |
| `motion-blur.css` | Motion blur page styles |
| `technique.html` | Shared DCT, DWT, and SVD information page |
| `upload.html` | Shared upload and results interface |
| `app.js` | Browser interactions and API calls |
| `styles.css` | Shared styles and responsive layout |
| `404.html` | Branded not-found page |
| `offline.html` | Offline fallback page |
| `service-worker.js` | Caching and offline support |
| `requirements.txt` | Python dependencies |
| `.python-version` | Python runtime selection |
| `vercel.json` | Vercel configuration |
| `.gitignore` | Local files excluded from Git |

## Request flow

```text
Browser
  |
  | loads HTML, CSS, JavaScript, and assets
  v
FastAPI application (backend/main.py)
  |
  | POST /api/process/{dct|dwt|svd}
  v
Image validation
  |
  v
Selected compression algorithm
  |
  v
WEBP output + compression metrics
  |
  | JSON response with processed_url
  v
Browser displays metrics and downloads result
```

## Where to make common changes

- Homepage content: `index.html`
- Visual design: `styles.css`
- Browser behavior or API requests: `app.js`
- DCT/DWT/SVD processing and API routes: `backend/main.py`
- Technique page content: `technique.html`
- Upload/result interface markup: `upload.html`
- Offline behavior: `service-worker.js` and `offline.html`
- Deployment settings: `vercel.json`
- Developer guidance: `README.md` and `docs/`

## Why the frontend files remain at the root

The current FastAPI routes explicitly serve `index.html`, `technique.html`, `upload.html`, `app.js`, `styles.css`, and files in `assets/`. Keeping them in their current locations avoids breaking live routes. The project is organized by responsibility through `api/`, `backend/`, `assets/`, and `docs/` without forcing a risky frontend migration.
