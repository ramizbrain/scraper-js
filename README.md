# Scraper JS

Scraper JS adalah layanan API untuk melakukan web scraping menggunakan Node.js, Elysia, dan Playwright. Proyek ini menggunakan arsitektur browser pool untuk efisiensi dan skalabilitas scraping.

## Fitur Utama

- Endpoint scraping: `/api/scrape`
- Endpoint kesehatan: `/api/scrape/health`
- Pool browser otomatis dengan pengaturan jumlah browser dan tab
- Validasi URL untuk keamanan
- Monitoring metrik pool: `/api/scrape/metrics`

## Instalasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Opsional) Salin `.env.example` menjadi `.env` dan sesuaikan konfigurasi jika diperlukan

## Menjalankan Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:8000`

## Endpoint API

### POST `/api/scrape`

Scrape halaman web dan dapatkan HTML-nya.

- **Body:**
  ```json
  { "url": "https://example.com" }
  ```
- **Response:**
  ```json
  {
    "html": "<html>...</html>",
    "status": 200,
    "success": true,
    "error": null
  }
  ```

### GET `/api/scrape/health`

Cek status kesehatan API.

### GET `/api/scrape/metrics`

Lihat statistik pool browser (jumlah browser aktif, tab, antrean, dsb).

## Konfigurasi Environment

Beberapa variabel penting yang dapat diatur di `.env`:

- `MAX_BROWSERS`: Jumlah maksimum browser yang berjalan bersamaan
- `MAX_TABS_PER_BROWSER`: Jumlah maksimum tab per browser
- `BROWSER_TYPE`: Jenis browser (chromium/firefox/webkit)
- `PAGE_NAVIGATION_TIMEOUT_MS`: Timeout navigasi halaman (ms)
- `BROWSER_IDLE_TIMEOUT_MS`: Timeout browser idle sebelum ditutup (ms)
- `POOL_SCAN_INTERVAL_MS`: Interval pengecekan pool (ms)

## Contoh Penggunaan API

```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Arsitektur Browser Pool

- Pool mengelola beberapa instance browser Playwright.
- Jika browser penuh, request akan diantre.
- Browser idle otomatis ditutup untuk menghemat resource.

## Lisensi

MIT
