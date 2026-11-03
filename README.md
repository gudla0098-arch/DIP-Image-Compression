# DIP Image Compression

A web interface for learning about and experimenting with three Digital Image Processing techniques:

- **DCT** — Discrete Cosine Transform
- **DWT** — Discrete Wavelet Transform
- **SVD** — Singular Value Decomposition

## Project structure

```text
DIP-Image-Compression/
├── assets/
│   ├── dct.png
│   ├── dwt.png
│   ├── favicon.ico
│   ├── hero.png
│   └── svd.png
├── app.js
├── index.html
├── technique.html
├── upload.html
├── styles.css
├── vercel.json
└── README.md
```

## Run the frontend locally

From the repository root, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

This starts a static web server for the frontend only. The image-processing action requires a backend API.

## Backend status

The current repository snapshot contains the frontend files and image assets. The frontend calls these API endpoints:

- `POST /api/process/dct`
- `POST /api/process/dwt`
- `POST /api/process/svd`

The backend implementation for these routes is not present in this repository snapshot yet. Image upload previews and the information pages can load, but actual compression, result metrics, and processed-image downloads require that backend to be added and deployed.

## Deployment

The `vercel.json` file includes rewrites for the technique and upload pages. Deploying the frontend alone does not provide the image-processing API; deploy the backend separately and configure the frontend API URL to point to it.
