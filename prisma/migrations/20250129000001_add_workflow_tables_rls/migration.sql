-- Enable RLS on new workflow tables
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "estimates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY leads_tenant_policy ON "leads"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for estimates
CREATE POLICY estimates_tenant_policy ON "estimates"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for visits
CREATE POLICY visits_tenant_policy ON "visits"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for payments
CREATE POLICY payments_tenant_policy ON "payments"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);
