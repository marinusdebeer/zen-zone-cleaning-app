-- Enable RLS on multi-tenant tables
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "line_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY clients_tenant_policy ON "clients"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for properties
CREATE POLICY properties_tenant_policy ON "properties"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for jobs
CREATE POLICY jobs_tenant_policy ON "jobs"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for line_items
CREATE POLICY line_items_tenant_policy ON "line_items"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

-- Create RLS policies for invoices
CREATE POLICY invoices_tenant_policy ON "invoices"
  FOR ALL
  TO public
  USING ("orgId" = current_setting('app.org_id')::text);

