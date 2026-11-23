// Netlify Function: Contact Form Handler
// Receives contact form submissions, validates, stores in Supabase, and sends email notification

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const resendApiKey = process.env.RESEND_API_KEY || '';
const contactEmail = process.env.CONTACT_EMAIL || 'subhasishdebadhikari@gmail.com';

// Rate limiting: simple in-memory store (resets on function cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { firstRequest: now, count: 1 });
    return false;
  }
  
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  
  return false;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Rate limiting
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, subject, message } = body;

    // Validation
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name is required (min 2 characters)');
    if (!email || !validateEmail(email)) errors.push('Valid email is required');
    if (!subject || subject.trim().length < 2) errors.push('Subject is required');
    if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters');

    if (errors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation failed', details: errors }),
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(name),
      email: sanitize(email),
      subject: sanitize(subject),
      message: sanitize(message),
      status: 'unread',
    };

    // Store in Supabase
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([sanitizedData]);

      if (dbError) {
        console.error('Supabase error:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save message. Please try again.' }),
        };
      }
    }

    // Send email notification via Resend
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: contactEmail,
            subject: `[Portfolio Contact] ${sanitizedData.subject}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${sanitizedData.name}</p>
              <p><strong>Email:</strong> ${sanitizedData.email}</p>
              <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Sent from your portfolio contact form</small></p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the request if email fails — message is already saved
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Message sent successfully!' }),
    };
  } catch (error) {
    console.error('Contact function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
}
