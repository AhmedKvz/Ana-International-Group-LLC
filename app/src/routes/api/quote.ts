import { createFileRoute } from '@tanstack/react-router';
import { bindings } from '../../lib/bindings.server';

type QuoteRequest = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  pickupDate: string;
  commodity: string;
  estimatedWeight: string;
  equipmentRequested: string;
  additionalDetails: string;
  website: string;
};

function chicagoToday(): string {
  const p = new Intl.DateTimeFormat('en-US',{ timeZone:'America/Chicago', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const date = Object.fromEntries(p.filter(x => x.type !== 'literal').map(x => [x.type,x.value]));
  return date.year+'-'+date.month+'-'+date.day;
}

const requiredText: (keyof QuoteRequest)[] = [
  'fullName','email','pickupCity','pickupState','pickupZip',
  'deliveryCity','deliveryState','deliveryZip','pickupDate','commodity','equipmentRequested'
];

function parseQuote(payload: unknown): { value?: QuoteRequest; error?: string } {
  if (typeof payload !== 'object' || !payload || Array.isArray(payload)) return { error: 'Invalid form data.' };
  const data = payload as Record<string, unknown>;
  const fields: (keyof QuoteRequest)[] = [
    'fullName','companyName','email','phone','pickupCity','pickupState',
    'pickupZip','deliveryCity','deliveryState','deliveryZip','pickupDate',
    'commodity','estimatedWeight','equipmentRequested','additionalDetails','website'
  ];
  const value = {} as QuoteRequest;
  for (const field of fields) {
    if (data[field] !== undefined && typeof data[field] !== 'string') return { error: 'Please check the form fields.' };
    value[field] = String(data[field] ?? '').trim() as never;
    if (value[field].length > (field === 'additionalDetails' ? 2000 : 200)) return { error: 'One of the fields is too long.' };
  }
  for (const field of requiredText) if (!value[field]) return { error: 'Complete all required fields.' };
  if (value.fullName.length < 2) return { error: 'Enter your full name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return { error: 'Enter a valid email address.' };
  if (value.phone && !/^[+()\d.\s-]{7,24}$/.test(value.phone)) return { error: 'Enter a valid phone number.' };
  for (const f of ['pickupState','deliveryState'] as const) {
    if (!/^[a-zA-Z]{2}$/.test(value[f])) return { error: 'Use a two-letter U.S. state abbreviation.' };
    value[f] = value[f].toUpperCase();
  }
  for (const f of ['pickupZip','deliveryZip'] as const) {
    if (!/^\d{5}(?:-\d{4})?$/.test(value[f])) return { error: 'Enter a valid ZIP code.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.pickupDate) ||
    !Number.isFinite(Date.parse(value.pickupDate)) ||
    new Date(value.pickupDate + 'T12:00:00Z').toISOString().slice(0,10) !== value.pickupDate)
    return { error: 'Enter a valid pickup date.' };
  const today = chicagoToday();
  if (value.pickupDate < today) return { error: 'Pickup date cannot be in the past.' };
  if (value.estimatedWeight && !/^\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s?(?:lbs?|pounds?))?$|^\d+(?:\.\d+)?(?:\s?(?:lbs?|pounds?))?$/i.test(value.estimatedWeight))
    return { error: 'Enter estimated weight in pounds, using numbers.' };
  if (value.equipmentRequested.length > 100) return { error: 'Select equipment requirements.' };
  return { value };
}

export const Route = createFileRoute('/api/quote')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { 'Cache-Control': 'no-store' };
        try {
          const origin = request.headers.get('origin');
          if (origin && origin !== new URL(request.url).origin) return Response.json({ ok:false, error: 'Invalid request origin.' }, { status: 403, headers });
          const len = Number(request.headers.get('content-length') || '0');
          if (len > 32000) return Response.json({ ok:false, error: 'Your message is too long.' }, { status: 413, headers });
          const raw = await request.text();
          if (raw.length > 32000) return Response.json({ ok:false, error: 'Your message is too long.' }, { status: 413, headers });
          const parsed = parseQuote(JSON.parse(raw));
          if (parsed.error || !parsed.value) return Response.json({ ok:false, error: parsed.error || 'Invalid inquiry.' }, { status:400, headers });
          const q = parsed.value;
          // Honeypot: never claim to have stored a request that was discarded.
          if (q.website) return Response.json({ ok:false, error:'Invalid request.' }, { status: 400, headers });
          const db = bindings().DB;
          if (!db) return Response.json({ ok:false, error: 'Online inquiries are not available yet. Please try again later.' }, { status: 503, headers });
          const saved = await db.prepare(
            'INSERT INTO freight_inquiries (id,full_name,company_name,email,phone,pickup_city,pickup_state,pickup_zip,delivery_city,delivery_state,delivery_zip,pickup_date,commodity,estimated_weight,equipment_requested,additional_details) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
          ).bind(
            crypto.randomUUID(),q.fullName,q.companyName,q.email,q.phone,q.pickupCity,q.pickupState,q.pickupZip,
            q.deliveryCity,q.deliveryState,q.deliveryZip,q.pickupDate,q.commodity,q.estimatedWeight,
            q.equipmentRequested,q.additionalDetails
          ).run();
          if (!saved.success) throw new Error('Database did not confirm inquiry storage.');
          return Response.json({ ok: true, message: 'Your inquiry was received.' }, { status: 201, headers });
        } catch (error) {
          console.error('Freight quote submission failed', error);
          return Response.json({ ok:false, error: 'We could not save your inquiry. Please try again.' }, { status:500, headers });
        }
      }
    }
  }
});
