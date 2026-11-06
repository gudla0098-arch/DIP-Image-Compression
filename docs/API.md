# API Reference

The FastAPI application is defined in `backend/main.py`. When running locally, the interactive Swagger UI is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

All image-processing requests use **multipart/form-data**.

## Base URL

- Local: `http://127.0.0.1:8000`
- Production: `https://dip-image-compression.vercel.app`

## 1. Health check

`GET /api/health`

Example response:

```json
{
  "ok": true,
  "service": "DIP Image Compression API"
}
```

## 2. Process an image

All three processing endpoints require an uploaded file in the `image` field.

| Endpoint | Technique | Additional form fields |
|---|---|---|
| `POST /api/process/dct` | Discrete Cosine Transform | `quality` |
| `POST /api/process/dwt` | Discrete Wavelet Transform | `wavelet`, `threshold` |
| `POST /api/process/svd` | Singular Value Decomposition | `rank` |

### DCT

| Field | Type | Default | Accepted values |
|---|---|---:|---|
| `image` | File | Required | PNG, JPG/JPEG, WEBP |
| `quality` | Integer | 55 | 10–90 |

```bash
curl -X POST http://127.0.0.1:8000/api/process/dct \
  -F "image=@photo.jpg" \
  -F "quality=55"
```

### DWT

| Field | Type | Default | Accepted values |
|---|---|---:|---|
| `image` | File | Required | PNG, JPG/JPEG, WEBP |
| `wavelet` | String | haar | haar, db2, sym2 |
| `threshold` | Number | 18 | 0–60 |

```bash
curl -X POST http://127.0.0.1:8000/api/process/dwt \
  -F "image=@photo.jpg" \
  -F "wavelet=haar" \
  -F "threshold=18"
```

### SVD

| Field | Type | Default | Accepted values |
|---|---|---:|---|
| `image` | File | Required | PNG, JPG/JPEG, WEBP |
| `rank` | Integer | 40 | At least 1; capped to the smaller image dimension |

```bash
curl -X POST http://127.0.0.1:8000/api/process/svd \
  -F "image=@photo.jpg" \
  -F "rank=40"
```

## 3. Successful response

A successful request returns JSON in this shape:

```json
{
  "technique": "dct",
  "output_filename": "dct_<unique-id>.webp",
  "processed_url": "/api/result/dct_<unique-id>.webp",
  "metrics": {
    "original_size_kb": 512.0,
    "processed_size_kb": 184.0,
    "compression_ratio": 2.7826,
    "size_reduction_percent": 64.06,
    "bytes_saved": 335872,
    "pixel_mse": 12.5,
    "psnr_db": 37.16,
    "quality_setting": 55
  }
}
```

The numbers are illustrative. Actual metrics depend on the uploaded image and settings. DWT responses also include `wavelet` and `threshold`; SVD responses include `retained_rank` and `maximum_rank`.

### Metrics explained

- **Original / processed size:** file sizes in kilobytes.
- **Compression ratio:** original file size divided by processed file size.
- **Size reduction:** percentage of bytes removed compared with the original file.
- **Bytes saved:** original size minus processed size.
- **MSE:** mean squared pixel error between the original and processed image.
- **PSNR:** peak signal-to-noise ratio in decibels; higher values generally indicate less pixel-level distortion.

## 4. Download the result

`GET /api/result/{filename}`

Use the `processed_url` returned by the processing endpoint. The response is an `image/webp` file.

```bash
curl -L "http://127.0.0.1:8000/api/result/dct_<unique-id>.webp" \
  --output compressed-image.webp
```

Result files are stored temporarily. They may not survive a restart, redeployment, or change of serverless instance. Download them promptly.

## 5. Common errors

| HTTP status | Meaning |
|---|---|
| 400 | No file supplied or uploaded file is not a valid image |
| 413 | File exceeds 12 MB or image dimensions exceed the configured pixel limit |
| 415 | Unsupported image format |
| 422 | Invalid technique setting or selected operation cannot process the image |
| 404 | API endpoint or processed result does not exist or has expired |

API errors use a JSON `detail` field.


## 6. Motion blur restoration

`POST /api/motion-blur`

Required multipart field: `image`. Optional fields:

| Field | Type | Default | Accepted values |
|---|---|---:|---|
| `blur_type` | String | linear | linear, uniform, circular, non-uniform |
| `length` | Integer | 18 | 3–45 px, limited by image dimensions |
| `angle` | Number | 0 | 0–180 degrees |
| `strength` | Number | 0.008 | 0.001–0.05 |

The endpoint builds a point-spread function from the selected model and applies Wiener deconvolution. Motion length is a user-supplied model parameter, not an automatically inferred measurement. Circular and non-uniform models are approximations. Use the returned `processed_url` with `GET /api/result/{filename}` to download the restored WEBP.
