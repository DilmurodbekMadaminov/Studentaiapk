# Talaba AI (Student AI) — Cloudflare Hosting Qo'llanmasi (Cloudflare Workers & Pages)

Loyihani Cloudflare platformasida 100% to'liq va uzluksiz ishga tushirish uchun barcha konfiguratsiyalar (`wrangler.jsonc`, `wrangler.toml`, `worker.ts`, `_headers` va `/functions/api/` Serverless Edge Functions) to'liq tayyorlandi.

---

## 🚀 1-Usul: Cloudflare Dashboard (GitHub orqali avtomatik deploy)

1. **GitHub omboriga yuklash:**
   - Ushbu loyiha kodlarini o'zingizning GitHub hisobingizga yuklang (Push qiling).

2. **Cloudflare hisobiga kirish:**
   - [Cloudflare Dashboard](https://dash.cloudflare.com/) ga kiring.
   - Chap paneldan **Workers & Pages** bo'limiga o'ting.
   - **talabaai-uz** loyihasini tanlang yoki **Create Application** -> **Connect to Git** qiling.

3. **Loyiha sozlamalari (Build Settings):**
   - **Project Name:** `talabaai-uz`
   - **Framework Preset:** `Vite` (yoki `None`)
   - **Build command:** `bun run build` (yoki `npm run build`)
   - **Build output directory:** `dist`
   - **Root directory:** `/`

4. **Muhit o'zgaruvchilari (Environment Variables):**
   - **Settings** -> **Environment variables** bo'limiga o'tib, quyidagini kiriting:
     - `GEMINI_API_KEY`: *Sizning Google Gemini API kalitingiz*

5. **Save and Deploy** tugmasini bosing.

---

## ⚡ 2-Usul: Wrangler CLI orqali to'g'ridan-to'g'ri deploy qilish

Loyiha Cloudflare Workers Static Assets bilan to'liq integratsiya qilingan:

```bash
# 1. Loyihaning frontend qismini yig'ish
npm run build:cf

# 2. To'g'ridan-to'g'ri deploy qilish
npx wrangler deploy
```

---

## 🛡️ Loyihadagi Cloudflare Funksiyalari:

- **Worker & Edge Serverless API (`worker.ts` & `/functions/api/`):** Cloudflare Edge tarmog'ida barcha API so'rovlari (`/api/ai/*`, `/api/subjects`, `/api/auth/*`, va h.k.) avtomatik ishlaydi.
- **Nativ SPA Routing:** Cloudflare Assets `single-page-application` rejimida sahifalarni hech qanday cheksiz looplarsiz bir zumda ochadi.
- **Security & Speed Headers (`_headers`):** HTTPS, HSTS, XSS himoyasi, X-Frame-Options va kesh boshqaruvi optimallashtirilgan.
- **Global CDN:** 300+ shaharlardagi Cloudflare serverlarida eng yuqori tezlikda yuklanadi.
