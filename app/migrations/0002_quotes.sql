CREATE TABLE IF NOT EXISTS freight_inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  pickup_city TEXT NOT NULL,
  pickup_state TEXT NOT NULL,
  pickup_zip TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_zip TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  commodity TEXT NOT NULL,
  estimated_weight TEXT,
  equipment_requested TEXT NOT NULL,
  additional_details TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS freight_inquiries_created_at_idx ON freight_inquiries (created_at DESC);
