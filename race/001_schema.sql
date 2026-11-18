-- Minimal DDL mirroring the tables the webhook writes to (with this change applied).
CREATE TABLE subscription(id text PRIMARY KEY,customer_id text NOT NULL,active boolean NOT NULL DEFAULT false,src text NOT NULL DEFAULT 'checkout');
CREATE TABLE stripe_truth(id text PRIMARY KEY,status text NOT NULL);
