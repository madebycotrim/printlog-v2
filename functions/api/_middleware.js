import { createRemoteJWKSet, jwtVerify } from 'jose';

const FIREBASE_PROJECT_ID = 'scae-cem03'; // TODO: Get from env if possible, or hardcode for now as per user plan

export async function onRequest(context) {
    const { request, env } = context;

    // Allow OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
        return context.next();
    }

    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Allow unauthenticated GET for now? Or strict? 
            // Plan says "Protect API Routes".
            // But Access Sync sends POST.
            // Student Sync sends GET.
            // Deployment verification might fail if I block everything immediately without token.
            // But I implemented `api.js` to send token.
            // Let's be strict.
            throw new Error('Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];

        // 1. Verify Token Signature & Claims
        const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
            audience: FIREBASE_PROJECT_ID,
        });

        // 2. Enforce Domain Restriction
        const email = payload.email || '';

        // Allow ONLY specific domains or dev/admin emails
        const allowedDomains = ['@edu.se.df.gov.br'];
        const allowedEmails = ['madebycotrim@gmail.com'];

        const isAllowed = allowedDomains.some(domain => email.endsWith(domain)) || allowedEmails.includes(email);

        if (!isAllowed) {
            // Log attempt
            console.warn(`Blocked login attempt from: ${email}`);
            throw new Error('Email unauthorized. Use an institutional account.');
        }

        // Attach user to context for downstream functions
        context.data.user = payload;

        return context.next();

    } catch (err) {
        console.error('Auth Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
