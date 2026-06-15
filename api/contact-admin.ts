// Vercel Serverless Function - 問題回報
// 儲存至 Supabase，並可透過 Resend 寄信給管理員

// @ts-ignore - Vercel runtime 會自動提供這些類型
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_EMAIL = 'hjr640511@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function saveToSupabase(userEmail: string, subject: string, message: string): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return false;

  const response = await fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_email: userEmail,
      subject,
      message,
      status: 'pending',
    }),
  });

  if (!response.ok) {
    console.error('Supabase contact_requests insert failed:', await response.text());
    return false;
  }
  return true;
}

async function sendAdminEmail(userEmail: string, subject: string, message: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM || 'TradeView <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [ADMIN_EMAIL],
      reply_to: userEmail,
      subject: `[TradeView 問題回報] ${subject}`,
      text: `來自用戶：${userEmail}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error('Resend email failed:', await response.text());
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subject, message } = (req.body || {}) as {
      email?: string;
      subject?: string;
      message?: string;
    };

    const userEmail = String(email || '').trim();
    const mailSubject = String(subject || '').trim();
    const mailMessage = String(message || '').trim();

    if (!userEmail || !mailSubject || !mailMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!EMAIL_RE.test(userEmail)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (mailSubject.length > 200 || mailMessage.length > 5000) {
      return res.status(400).json({ error: 'Content too long' });
    }

    const [stored, emailed] = await Promise.all([
      saveToSupabase(userEmail, mailSubject, mailMessage),
      sendAdminEmail(userEmail, mailSubject, mailMessage),
    ]);

    if (!stored && !emailed) {
      return res.status(503).json({
        error: 'Unable to deliver contact request',
        stored,
        emailed,
      });
    }

    return res.status(200).json({ success: true, stored, emailed });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('contact-admin error:', error);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
