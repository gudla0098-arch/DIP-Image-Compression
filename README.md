# DIP Image Compression

A web application for exploring and testing three Digital Image Processing techniques:

- **DCT** — Discrete Cosine Transform with 8×8 block transforms and coefficient quantization.
- **DWT** — Discrete Wavelet Transform with selectable wavelets and detail-coefficient thresholding.
- **SVD** — Singular Value Decomposition with adjustable retained rank.

## Project structure

```text
DIP-Image-Compression/
├── assets/                 # Landing-page images and icon
├── backend/
│   ├── __init__.py
│   └── main.py              # FastAPI server and image-processing APIs
├── app.js                   # Frontend interactions
├── index.html
├── technique.html
├── upload.html
├── styles.css
├── requirements.txt
├── render.yaml              # Render deployment blueprint
├── vercel.json              # Optional frontend route rewrites
└── README.md
```

## Run locally

Use Python 3.11 or newer.

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Open http://127.0.0.1:8000.

## API

- `GET /api/health` — service health check.
- `POST /api/process/dct` — multipart image upload with `quality` (10–90).
- `POST /api/process/dwt` — multipart image upload with `wavelet` (haar, db2, sym2) and `threshold` (0–60).
- `POST /api/process/svd` — multipart image upload with `rank` (at least 1).
- `GET /api/result/{filename}` — retrieve the processed WebP image.

The API response includes `processed_url`, `output_filename`, compression ratio, size reduction, bytes saved, MSE and PSNR.

## Limits and notes

- Supported inputs: PNG, JPG/JPEG and WEBP.
- Maximum upload size: 12 MB.
- Maximum decoded image size: 4 million pixels to protect the processing service.
- The output is encoded as WebP; measured file-size savings can vary with the original image and selected settings.
- Processing results are stored temporarily on the server and may disappear after a restart or redeploy. Download results when they are ready.
- No database is required for the current upload → process → download workflow. A database can be added later for accounts or saved processing history.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select this repository.
3. Render reads `render.yaml`, installs `requirements.txt`, and starts the FastAPI app.
4. Wait for the `/api/health` check to pass, then open the Render service URL.

The same FastAPI service serves both the frontend pages and the API, so the existing relative API calls in `app.js` work without a separate CORS configuration.
