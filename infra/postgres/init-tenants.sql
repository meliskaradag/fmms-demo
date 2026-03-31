-- FMMS Demo: Tenant schema initialization
-- Her tenant icin ayri PostgreSQL schema olusturulur

CREATE SCHEMA IF NOT EXISTS tenant_abc_avm;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA tenant_abc_avm TO fmms;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_abc_avm GRANT ALL ON TABLES TO fmms;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_abc_avm GRANT ALL ON SEQUENCES TO fmms;

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
