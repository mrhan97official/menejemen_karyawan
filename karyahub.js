/**
 * Vercel Function: /api/karyahub
 *
 * Browser -> Vercel (same origin) -> Google Apps Script -> Google Sheets
 *
 * Configuration:
 * - GAS_API_URL ditempel langsung di file ini.
 * - KARYAHUB_PROXY_KEY juga ditempel langsung di file ini.
 */


// Tempel URL Web App Google Apps Script Anda di bawah ini.
// Harus menggunakan URL deployment yang berakhiran /exec.
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw9TTFJ_GfDyMtBVDqkX1uBUw1WNrKqw6DvkK1NKzDVVH7Cn1RkyzVUK8onPTqLM3KcTQ/exec';

// Tempel KARYAHUB_PROXY_KEY dari Execution log Apps Script di bawah ini.
const KARYAHUB_PROXY_KEY = '86a75d8d4c124c80a454b7b02d8a2394c9c83272a3614ed39bf1b7ff1437c1b172f74f5ddbe646a4b8509ec88a0a7d70';

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
const UPSTREAM_TIMEOUT_MS = 28000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'KaryaHub Vercel Gateway',
      configured: Boolean(
        GAS_API_URL &&
        !GAS_API_URL.includes('TEMPEL_GAS_API_URL') &&
        KARYAHUB_PROXY_KEY &&
        !KARYAHUB_PROXY_KEY.includes('TEMPEL_KARYAHUB_PROXY_KEY')
      )
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method tidak diizinkan.' }
    });
  }

  const gasUrl = String(GAS_API_URL || '').trim();
  const proxyKey = String(KARYAHUB_PROXY_KEY || '').trim();

  if (!gasUrl || !proxyKey) {
    return res.status(500).json({
      ok: false,
      error: {
        code: 'GATEWAY_NOT_CONFIGURED',
        message: 'GAS_API_URL atau KARYAHUB_PROXY_KEY belum ditempel di api/karyahub.js.'
      }
    });
  }

  try {
    const contentLength = Number(req.headers['content-length'] || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return res.status(413).json({
        ok: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request terlalu besar.' }
      });
    }

    const body = normalizeBody(req.body);
    const action = String(body.action || '').trim();
    const args = Array.isArray(body.args) ? body.args : [];

    if (!/^api[A-Z][A-Za-z0-9]*$/.test(action)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_ACTION', message: 'Action API tidak valid.' }
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    let upstream;
    try {
      upstream = await fetch(gasUrl, {
        method: 'POST',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          // text/plain menghindari asumsi khusus MIME di Apps Script.
          // Payload tetap JSON dan diparse dari e.postData.contents.
          'Content-Type': 'text/plain;charset=UTF-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          proxyKey,
          action,
          args
        })
      });
    } finally {
      clearTimeout(timeout);
    }

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: {
          code: 'INVALID_UPSTREAM_RESPONSE',
          message: 'Apps Script mengembalikan respons yang tidak valid.'
        }
      });
    }

    if (!data || typeof data !== 'object') {
      return res.status(502).json({
        ok: false,
        error: { code: 'EMPTY_UPSTREAM_RESPONSE', message: 'Respons Apps Script kosong.' }
      });
    }

    // ContentService Apps Script umumnya mengembalikan HTTP 200;
    // status aplikasi dipetakan di gateway ini.
    if (data.ok === false) {
      const code = String(data?.error?.code || 'UPSTREAM_ERROR');
      const status = mapErrorStatus(code);
      return res.status(status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({
        ok: false,
        error: { code: 'UPSTREAM_TIMEOUT', message: 'Google Apps Script terlalu lama merespons.' }
      });
    }

    console.error('[KaryaHub Gateway]', error);
    return res.status(500).json({
      ok: false,
      error: { code: 'GATEWAY_ERROR', message: 'Gateway database mengalami kesalahan.' }
    });
  }
}

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return {};
}

function mapErrorStatus(code) {
  if (code === 'PROXY_FORBIDDEN') return 403;
  if (code === 'DATABASE_NOT_SETUP') return 503;
  if (code === 'ACTION_NOT_ALLOWED' || code === 'INVALID_BODY' || code === 'INVALID_JSON' || code === 'EMPTY_BODY') return 400;
  return 400;
}
