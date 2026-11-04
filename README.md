# IP — Digital Image Processing

A web application for learning and experimenting with three image-compression techniques: **DCT**, **DWT**, and **SVD**. Upload an image, adjust technique-specific settings, process it through the FastAPI backend, and inspect compression and image-quality metrics.

**Live website:** https://dip-image-compression.vercel.app  
**Source code:** https://github.com/gudla0098-arch/DIP-Image-Compression

---

## Contents

- [Features](#features)
- [How the application works](#how-the-application-works)
- [Project structure](#project-structure)
- [Technology stack](#technology-stack)
- [Run locally](#run-locally)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Limits and important notes](#limits-and-important-notes)
- [Documentation](#documentation)

## Features

- **DCT — Discrete Cosine Transform:** block-based 8×8 transform and coefficient quantization.
- **DWT — Discrete Wavelet Transform:** wavelet decomposition and detail-coefficient thresholding.
- **SVD — Singular Value Decomposition:** image reconstruction using a selected matrix rank.
- Upload PNG, JPG/JPEG, or WEBP images.
- Download the processed WEBP image.
- View file-size and image-quality metrics, including compression ratio, size reduction, bytes saved, MSE, and PSNR.
- Public pages with no sign-in requirement.
- Custom 404 page and an offline fallback page.

## How the application works

1. The visitor selects DCT, DWT, or SVD.
2. The browser opens the relevant upload page.
3. The frontend sends the image and selected settings to the FastAPI endpoint.
4. The backend validates the image and applies the selected transform.
5. The processed image is encoded as WEBP and the API returns its filename, download URL, and metrics.
6. The browser displays the result and lets the visitor download it.

## Project structure

The current layout intentionally keeps the HTML pages, stylesheet, JavaScript, and assets at the repository root. The FastAPI application serves these files using explicit routes, so moving them into new folders would require coordinated route and deployment changes.

```text
DIP-Image-Compression/
│
├── api/
│   └── index.py             # Vercel serverless entry point
│
├── assets/                  # Images and visual assets used by the website
│
├── backend/
│   ├── __init__.py
│   └── main.py              # FastAPI app, API routes, and compression logic
│
├── docs/
│   ├── API.md               # API endpoints, parameters, and responses
│   └── PROJECT_STRUCTURE.md # Guide to the folders and important files
│
├── 404.html                 # Branded not-found page
├── app.js                   # Frontend interactions and API requests
├── index.html               # Public homepage
├── offline.html             # Offline fallback page
├── service-worker.js        # Offline caching and service-worker behavior
├── styles.css               # Shared website styles
├── technique.html           # DCT, DWT, and SVD information page
├── upload.html              # Image upload and result interface
│
├── .gitignore               # Files excluded from Git
├── .python-version          # Python runtime version for deployment
├── requirements.txt         # Python dependencies
├── vercel.json              # Vercel configuration
└── README.md                # Project overview and setup guide
```

## Technology stack

| Area | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Image processing | Pillow, NumPy, SciPy, PyWavelets |
| API server (local) | Uvicorn |
| Hosting | Vercel |

## Run locally

### 1. Requirements

- Python 3.12 (recommended; see `.python-version`)
- Git

### 2. Clone the repository

```bash
git clone https://github.com/gudla0098-arch/DIP-Image-Compression.git
cd DIP-Image-Compression
```

### 3. Create and activate a virtual environment

**Windows PowerShell**

```powershell
py -3.12 -m venv .venv
.venv\\Scripts\\Activate.ps1
```

**macOS / Linux**

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

### 4. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Start the application

```bash
uvicorn backend.main:app --reload
```

Open **http://127.0.0.1:8000** in your browser.

Interactive API documentation is available at **http://127.0.0.1:8000/docs** while the local server is running.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check whether the API is running |
| POST | `/api/process/dct` | Compress an image using DCT |
| POST | `/api/process/dwt` | Compress an image using DWT |
| POST | `/api/process/svd` | Compress an image using SVD |
| GET | `/api/result/{filename}` | Retrieve a generated WEBP result |

The upload field is named `image`. Technique settings are sent as multipart form fields. See **[API documentation](docs/API.md)** for parameter ranges, example requests, and response details.

## Deployment

This repository is configured for **Vercel**.

1. Push your changes to the `main` branch on GitHub.
2. In Vercel, import `gudla0098-arch/DIP-Image-Compression`.
3. Keep the Python framework configuration and the repository's `vercel.json`.
4. Deploy the project.
5. After deployment, check:
   - `/` — homepage
   - `/technique/dct`, `/technique/dwt`, `/technique/svd` — technique pages
   - `/upload/dct`, `/upload/dwt`, `/upload/svd` — upload pages
   - `/api/health` — API health check
   - `/not-a-real-page` — branded 404 behavior

The Vercel entry point is `api/index.py`, which imports the FastAPI app from `backend/main.py`.

## Limits and important notes

- Supported input formats: PNG, JPG/JPEG, and WEBP.
- Maximum upload size: **12 MB**.
- Maximum decoded image size: **4 million pixels**.
- Processed images are returned as WEBP files.
- Result files are written to temporary server storage. They are not permanent and may become unavailable after a serverless instance changes, restarts, or is redeployed. Download a result as soon as it is ready.
- Compression ratio and size reduction depend on the input image and the selected technique/settings.

## Documentation

- [API reference](docs/API.md)
- [Project structure guide](docs/PROJECT_STRUCTURE.md)

---

Made as a Digital Image Processing project for learning, experimenting, and comparing image-compression techniques.
