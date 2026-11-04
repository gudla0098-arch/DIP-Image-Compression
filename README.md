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
├── login.html
├── signin.html
├── auth.css
├── auth.js
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
- `POST /api/auth/signup` — create an account and start a session.
- `POST /api/auth/login` — verify credentials and start a session.
- `GET /api/auth/me` — return the signed-in account.
- `POST /api/auth/logout` — revoke the current session.

Open `/login` to log in or `/signin` to create an account. Passwords are stored as PBKDF2-SHA256 hashes; sessions use random HttpOnly cookies and expire after 14 days.
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
- Account data is stored in a SQL database. For local development, the app creates `dip_auth.db` (SQLite) automatically.
- For a persistent production database, set `DATABASE_URL` to a PostgreSQL connection URL in the hosting service environment. The Render blueprint includes this as a secret environment variable that you must fill in. Without it, the default SQLite database is local/ephemeral on many hosted platforms.
- Password reset emails are not enabled yet; the visible “Forget Password” link explains that to the user.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select this repository.
3. Render reads `render.yaml`, installs `requirements.txt`, and starts the FastAPI app.
4. Wait for the `/api/health` check to pass, then open the Render service URL.

The same FastAPI service serves the frontend pages and API, so relative API calls work without a separate CORS configuration. Use the Render service URL for the working authenticated site. The Vercel rewrites expose the static login and sign-in HTML routes, but a static Vercel deployment alone does not run the FastAPI authentication API; it needs an API proxy to the deployed backend.
