-- FMMS Demo Seed Data
-- AVM (Shopping Mall) Klima Bakım Senaryosu
-- Tüm demo kullanıcıları: admin@abc-avm.com, ahmet@abc-avm.com (teknisyen), zeynep@abc-avm.com (stok), mehmet@abc-avm.com (yönetici)

SET client_encoding TO 'UTF8';

-- ============================
-- TENANT (public schema)
-- ============================
INSERT INTO public."Tenants" ("Id", "Name", "LegalName", "TradeName", "Slug", "SchemaName", "TaxOffice", "TaxNumber", "BillingAddress", "BillingCity", "BillingCountry", "ContactEmail", "ContactPhone", "SubscriptionPlan", "IsActive", "Settings")
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'ABC AVM',
    'ABC Alışveriş Merkezi Yönetim A.Ş.',
    'ABC AVM',
    'abc-avm',
    'tenant_abc_avm',
    'Kadıköy V.D.',
    '1234567890',
    'Bağdat Cad. No:123',
    'İstanbul',
    'TR',
    'info@abc-avm.com',
    '+90 216 555 0000',
    'enterprise',
    true,
    '{}'
) ON CONFLICT DO NOTHING;

-- ============================
-- LOCATIONS (public schema - EF uses public for demo)
-- ============================
SET search_path TO public;

-- Ana Bina
INSERT INTO "Locations" ("Id", "TenantId", "Name", "Type", "ParentId", "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd", "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('10000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ABC AVM Ana Bina', 0, NULL, false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false);

-- Katlar
INSERT INTO "Locations" ("Id", "TenantId", "Name", "Type", "ParentId", "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd", "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('10000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bodrum Kat (B1)', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zemin Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1. Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2. Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Çatı Katı (Mekanik)', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false);

-- Özel Alanlar
INSERT INTO "Locations" ("Id", "TenantId", "Name", "Type", "ParentId", "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd", "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('10000000-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mekanik Oda - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Elektrik Odası - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Depo - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Food Court Alanı', 2, '10000000-0000-0000-0000-000000000013', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU Odası - Çatı', 2, '10000000-0000-0000-0000-000000000014', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false);

-- ============================
-- ASSETS (Klima, fan coil, chiller vb.)
-- ============================
INSERT INTO "Assets" ("Id", "TenantId", "Name", "Category", "LocationId", "AssetNumber", "Status", "Manufacturer", "Model", "SerialNumber", "InstallationDate", "BatchNumber", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('20000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Chiller Ünite #1', 'HVAC - Chiller', '10000000-0000-0000-0000-000000000020', 'AST-HVAC-001', 0, 'Carrier', '30XA-0802', 'CR-2023-001', '2023-06-15', 'B2023-01', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Chiller Ünite #2', 'HVAC - Chiller', '10000000-0000-0000-0000-000000000020', 'AST-HVAC-002', 0, 'Carrier', '30XA-0802', 'CR-2023-002', '2023-06-15', 'B2023-01', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-01 (Zemin Kat)', 'HVAC - AHU', '10000000-0000-0000-0000-000000000024', 'AST-HVAC-003', 0, 'Daikin', 'AHU-150', 'DK-2023-003', '2023-07-01', 'B2023-02', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-02 (1. Kat)', 'HVAC - AHU', '10000000-0000-0000-0000-000000000024', 'AST-HVAC-004', 0, 'Daikin', 'AHU-150', 'DK-2023-004', '2023-07-01', 'B2023-02', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-03 (2. Kat / Food Court)', 'HVAC - AHU', '10000000-0000-0000-0000-000000000024', 'AST-HVAC-005', 0, 'Daikin', 'AHU-200', 'DK-2023-005', '2023-07-01', 'B2023-02', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fan Coil Ünite - Zemin Z01', 'HVAC - Fan Coil', '10000000-0000-0000-0000-000000000011', 'AST-FC-001', 0, 'Alarko', 'FCU-400', 'AL-2023-010', '2023-08-01', 'B2023-03', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fan Coil Ünite - 1.Kat K01', 'HVAC - Fan Coil', '10000000-0000-0000-0000-000000000012', 'AST-FC-002', 0, 'Alarko', 'FCU-400', 'AL-2023-011', '2023-08-01', 'B2023-03', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Asansör #1', 'Asansör', '10000000-0000-0000-0000-000000000001', 'AST-ELV-001', 0, 'Otis', 'Gen2-MR', 'OT-2022-001', '2022-12-01', 'B2022-01', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Yangın Algılama Paneli', 'Yangın Güvenlik', '10000000-0000-0000-0000-000000000021', 'AST-FIRE-001', 0, 'Siemens', 'FC-2060', 'SM-2023-001', '2023-01-15', 'B2023-04', NOW(), '127.0.0.1', false),
('20000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jeneratör', 'Elektrik', '10000000-0000-0000-0000-000000000021', 'AST-GEN-001', 0, 'Aksa', 'APD-825', 'AK-2022-001', '2022-06-01', 'B2022-02', NOW(), '127.0.0.1', false);

-- ============================
-- STOCK CARDS (Bakım malzemeleri)
-- ============================
INSERT INTO "StockCards" ("Id", "TenantId", "StockNumber", "Name", "Category", "Unit", "MinStockLevel", "UnitPrice", "Currency", "CodeSource", "ToleranceValue", "ToleranceType", "IsActive", "ParentId", "HierarchyLevel", "HierarchyPath", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('30000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001', 'Tesis Bakım Sarf Envanteri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, NULL, 0, 'Tesis Bakım Sarf Envanteri', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01', 'HVAC Sarf Malzemeleri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-01', 'Filtreler', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-02', 'Kimyasallar ve Yağlar', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-03', 'Mekanik Aktarma ve Vana', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02', 'Elektrik ve Güç Sistemleri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02-01', 'Jeneratör Bakım Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Jeneratör Bakım Sarfı', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-001', 'AHU Panel Filtre 592x592x48mm', 'Filtre', 'adet', 10, 450.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > AHU Panel Filtre 592x592x48mm', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-002', 'AHU HEPA Filtre H13', 'Filtre', 'adet', 5, 1200.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > AHU HEPA Filtre H13', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BLT-001', 'Fan Kayışı A68', 'Kayış', 'adet', 4, 320.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Fan Kayışı A68', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-REF-001', 'R410A Soğutucu Gaz', 'Soğutucu Gaz', 'kg', 20, 850.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > R410A Soğutucu Gaz', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-OIL-001', 'Kompresör Yağı POE 68', 'Yağ', 'litre', 10, 680.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Kompresör Yağı POE 68', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-CLN-001', 'Evaporatör Temizleme Spreyi', 'Temizlik', 'adet', 15, 120.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Evaporatör Temizleme Spreyi', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BRG-001', 'Fan Motor Rulmanı 6205-2RS', 'Rulman', 'adet', 6, 280.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Fan Motor Rulmanı 6205-2RS', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-VLV-001', 'Genleşme Vanası TXV-R410A', 'Vana', 'adet', 3, 1450.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Genleşme Vanası TXV-R410A', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-GEN-001', 'Jeneratör Yağ Filtresi LF-9009', 'Filtre', 'adet', 2, 390.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000015', 3, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Jeneratör Bakım Sarfı > Jeneratör Yağ Filtresi LF-9009', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-03', 'Yangın Güvenlik Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-03-01', 'Algılama ve Bildirim', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000017', 2, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-04', 'Su ve Sıhhi Tesisat', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-04-01', 'Pompa ve Hidrofor', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000019', 2, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02-02', 'Aydınlatma Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Aydınlatma Sarfı', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FIRE-001', 'Adresli Duman Dedektörü', 'Yangın', 'adet', 12, 980.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000018', 3, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim > Adresli Duman Dedektörü', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FIRE-002', 'Siren Flaşör 24V', 'Yangın', 'adet', 8, 760.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000018', 3, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim > Siren Flaşör 24V', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-PMP-001', 'Hidrofor Mekanik Salmastra Seti', 'Pompa', 'set', 3, 1150.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000020', 3, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor > Hidrofor Mekanik Salmastra Seti', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000025', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-PMP-002', 'Sirkülasyon Pompası Kaplin Lastiği', 'Pompa', 'adet', 6, 210.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000020', 3, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor > Sirkülasyon Pompası Kaplin Lastiği', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000026', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-ELC-001', 'Kontaktör 32A 3P', 'Elektrik', 'adet', 10, 340.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Kontaktör 32A 3P', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000027', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-ELC-002', 'LED Panel Sürücüsü 36W', 'Elektrik', 'adet', 10, 180.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000021', 3, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Aydınlatma Sarfı > LED Panel Sürücüsü 36W', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000028', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-HVAC-001', 'Kondenser Coil Temizleyici 5L', 'Kimyasal', 'adet', 4, 540.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Kondenser Coil Temizleyici 5L', NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000029', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-003', 'Fan Coil Ön Filtre G4', 'Filtre', 'adet', 20, 90.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > Fan Coil Ön Filtre G4', NOW(), '127.0.0.1', false);

-- ============================
-- STOCK BALANCES (Depo: B1 Depo lokasyonu)
-- ============================
INSERT INTO "StockBalances" ("Id", "TenantId", "StockCardId", "LocationId", "CurrentStock", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('31000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 25, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000022', 8, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000022', 12, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000022', 15, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000022', 8, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000022', 30, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000022', 3, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000022', 2, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000022', 5, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000022', 18, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000022', 11, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000022', 4, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000022', 9, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000022', 14, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000022', 22, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000022', 7, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000022', 35, NOW(), '127.0.0.1', false);

-- ============================
-- VENDORS
-- ============================
INSERT INTO "Vendors" ("Id", "TenantId", "TradeName", "InvoiceName", "ContactPerson", "Phone", "Email", "VendorType", "Rating", "ContractStart", "ContractEnd", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('40000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KlimaTek Mühendislik', 'KlimaTek Müh. Hiz. Ltd. Şti.', 'Ali Yılmaz', '+90 532 555 1111', 'ali@klimatek.com', 0, 4.5, '2024-01-01', '2026-12-31', NOW(), '127.0.0.1', false),
('40000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Asansör Bakım A.Ş.', 'Asansör Bakım ve Servis A.Ş.', 'Fatma Demir', '+90 533 555 2222', 'fatma@asansor-bakim.com', 0, 4.2, '2024-03-01', '2026-02-28', NOW(), '127.0.0.1', false),
('40000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ElektroSistem', 'ElektroSistem Enerji San. Tic. A.Ş.', 'Hasan Kaya', '+90 534 555 3333', 'hasan@elektrosistem.com', 0, 4.0, '2024-06-01', '2026-05-31', NOW(), '127.0.0.1', false);

-- ============================
-- SERVICE AGREEMENTS
-- ============================
INSERT INTO "ServiceAgreements" ("Id", "TenantId", "VendorId", "AgreementNumber", "Title", "ScopeDescription", "StartDate", "EndDate", "AutoRenew", "SlaResponseHours", "SlaResolutionHours", "Cost", "Currency", "Status", "CoveredAssetIds", "CoveredMaintTypes", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('50000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000001', 'SA-2024-001', 'HVAC Yıllık Bakım Sözleşmesi', 'Tüm klima, AHU ve chiller ünitelerinin yıllık periyodik bakımı. Aylık filtre kontrolü, 3 ayda bir genel bakım, yılda bir kez kapsamlı bakım.', '2024-01-01', '2026-12-31', true, 4, 24, 480000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000001","20000000-0000-0000-0000-000000000002","20000000-0000-0000-0000-000000000003","20000000-0000-0000-0000-000000000004","20000000-0000-0000-0000-000000000005"]', '["Preventive","Corrective"]', NOW(), '127.0.0.1', false),
('50000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000002', 'SA-2024-002', 'Asansör Bakım Sözleşmesi', 'Tüm asansörlerin aylık periyodik bakımı ve acil arıza müdahale hizmeti.', '2024-03-01', '2026-02-28', true, 2, 8, 120000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000008"]', '["Preventive","Corrective"]', NOW(), '127.0.0.1', false),
('50000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000003', 'SA-2024-003', 'Elektrik Tesisat Bakım Sözleşmesi', 'Jeneratör, UPS, pano ve tesisat bakımı. Aylık kontrol ve yıllık kapsamlı bakım.', '2024-06-01', '2026-05-31', false, 4, 48, 96000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000010"]', '["Preventive"]', NOW(), '127.0.0.1', false);

-- ============================
-- MAINTENANCE CARDS
-- ============================
INSERT INTO "MaintenanceCards" ("Id", "TenantId", "Name", "AssetCategory", "Description", "EstimatedDuration", "Level", "DefaultPeriodDays", "IsTemplate", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('60000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU Aylık Periyodik Bakım', 'HVAC - AHU', 'AHU ünitelerinin aylık düzenli bakım prosedürü. Filtre kontrolü, kayış kontrolü, yatak kontrolü.', '02:00:00', 1, 30, true, NOW(), '127.0.0.1', false),
('60000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chiller 3 Aylık Bakım', 'HVAC - Chiller', 'Chiller ünitelerinin 3 aylık kapsamlı bakımı. Soğutucu gaz kontrolü, kompresör yağı kontrolü, kondenser temizliği.', '04:00:00', 2, 90, true, NOW(), '127.0.0.1', false),
('60000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fan Coil Ünite Bakım', 'HVAC - Fan Coil', 'Fan coil ünitelerinin filtre değişimi ve genel kontrol.', '00:45:00', 0, 30, true, NOW(), '127.0.0.1', false);

-- Bakım Kartı Adımları - AHU Aylık
INSERT INTO "MaintenanceCardSteps" ("Id", "TenantId", "CardId", "StepOrder", "Instruction", "StepStatus", "EstimatedMinutes", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('61000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 1, 'Üniteyi kapatın ve enerji kesildiğini doğrulayın', 0, 5, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 2, 'Filtreleri çıkartın ve kirlilik seviyesini kontrol edin. Fotoğraf çekin.', 0, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 3, 'Filtreleri temizleyin veya yenisiyle değiştirin', 0, 20, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 4, 'V-Kayış gerginliğini kontrol edin. Aşınma varsa değiştirin', 0, 15, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 5, 'Fan motoru rulmanlarını dinleyin ve vibrasyon kontrolü yapın', 0, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 6, 'Damper mekanizmasını kontrol edin', 1, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 7, 'Serpantin temizliği yapın (gerekirse)', 1, 20, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 8, 'Üniteyi çalıştırın ve test edin. Sonuç fotoğrafı çekin', 0, 10, NOW(), '127.0.0.1', false);

-- Bakım Kartı Malzemeleri - AHU Aylık
INSERT INTO "MaintenanceCardMaterials" ("Id", "TenantId", "CardId", "StockCardId", "Quantity", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('62000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 4, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 1, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 2, NOW(), '127.0.0.1', false);

-- ============================
-- WORK ORDERS (Çeşitli durumlarla)
-- ============================
INSERT INTO "WorkOrders" ("Id", "TenantId", "OrderNumber", "Type", "Priority", "Status", "Title", "ReportedBy", "LocationId", "ScheduledStart", "ActualStart", "ActualEnd", "SlaDeadline", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
-- Completed WO
('70000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260301-A1B2C3', 1, 1, 4, 'AHU-01 Aylık Periyodik Bakım - Mart', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '2026-03-01 08:00:00', '2026-03-01 08:15:00', '2026-03-01 10:30:00', '2026-03-02 08:00:00', '2026-02-25 10:00:00', '127.0.0.1', false),
-- InProgress WO (current demo scenario)
('70000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260320-D4E5F6', 1, 1, 2, 'AHU-03 Food Court Klima Bakımı', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', '2026-03-20 09:00:00', '2026-03-20 09:10:00', NULL, '2026-03-21 09:00:00', '2026-03-18 14:00:00', '127.0.0.1', false),
-- Assigned WO
('70000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260325-G7H8I9', 1, 1, 1, 'Chiller #1 Üç Aylık Bakım', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '2026-03-28 08:00:00', NULL, NULL, '2026-03-29 08:00:00', '2026-03-22 09:00:00', '127.0.0.1', false),
-- Open WOs
('70000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-J1K2L3', 0, 2, 0, 'Zemin Kat Fan Coil Arızası - Soğutma Yapmıyor', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', NULL, NULL, NULL, '2026-03-27 12:00:00', '2026-03-26 08:30:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-M4N5O6', 0, 3, 0, 'Food Court Havalandırma Gürültü Şikayeti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', NULL, NULL, NULL, '2026-03-26 18:00:00', '2026-03-26 10:15:00', '127.0.0.1', false),
-- Overdue WO
('70000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260320-P7Q8R9', 0, 2, 1, '1. Kat Fan Coil Kaçak Tespiti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '2026-03-22 08:00:00', NULL, NULL, '2026-03-24 08:00:00', '2026-03-20 16:00:00', '127.0.0.1', false),
-- More completed WOs for chart data
('70000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260215-S1T2U3', 1, 0, 4, 'AHU-02 Aylık Bakım - Şubat', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '2026-02-15 08:00:00', '2026-02-15 08:20:00', '2026-02-15 10:00:00', '2026-02-16 08:00:00', '2026-02-10 10:00:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260210-V4W5X6', 0, 1, 4, 'Chiller #2 Soğutucu Gaz Kaçağı Onarımı', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '2026-02-10 14:00:00', '2026-02-10 14:30:00', '2026-02-10 18:00:00', '2026-02-11 14:00:00', '2026-02-10 11:00:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260128-Y7Z8A9', 2, 2, 4, 'Jeneratör titreşim kestirimci analizi', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', '2026-01-28 09:00:00', '2026-01-28 09:10:00', '2026-01-28 11:20:00', '2026-01-29 09:00:00', '2026-01-26 15:00:00', '127.0.0.1', false);

-- ============================
-- WORK ORDER ASSIGNEES
-- ============================
INSERT INTO "WorkOrderAssignees" ("Id", "TenantId", "WorkOrderId", "UserId", "Role", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
-- Ahmet (teknisyen) tüm aktif WO'lara atanmış
('71000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-26 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-19 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-23 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-21 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-12 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-10 12:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'technician', '2026-03-26 09:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'technician', '2026-01-27 14:00:00', '127.0.0.1', false);

-- ============================
-- STOCK MOVEMENTS (Tuketim hizi / maliyet metrikleri)
-- ============================
INSERT INTO "StockMovements" ("Id", "TenantId", "StockCardId", "MovementType", "Quantity", "FromLocationId", "ToLocationId", "ReferenceType", "ReferenceId", "Notes", "PerformedBy", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('32000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001', 1, 6, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000024', 'WorkOrder', '70000000-0000-0000-0000-000000000001', 'AHU aylik bakim filtre kullanimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '28 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', 1, 10, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000008', 'Chiller gaz takviyesi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '24 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000006', 1, 5, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000023', 'WorkOrder', '70000000-0000-0000-0000-000000000002', 'Food court serpantin temizligi', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '18 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000029', 1, 12, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000011', 'WorkOrder', '70000000-0000-0000-0000-000000000004', 'Fan coil filtre degisimi', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '12 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000005', 1, 3, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000003', 'Chiller yag tamamlama', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '8 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000003', 1, 4, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000024', 'WorkOrder', '70000000-0000-0000-0000-000000000007', 'Kayis degisimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', 1, 7, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000006', 'Acil sogutucu gaz tuketimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 day', '127.0.0.1', false);

-- ============================
-- PERIODIC MAINTENANCE (Time-Based Demo)
-- ============================
-- Chiller kartına malzeme ekle (stok bilinçli blokaj senaryosu için)
INSERT INTO "MaintenanceCardMaterials" ("Id", "TenantId", "CardId", "StockCardId", "Quantity", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('62000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 25, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 5, NOW(), '127.0.0.1', false);

INSERT INTO "MaintenancePlans" (
    "Id", "TenantId", "Name", "MaintenanceCardId", "AssetId", "TriggerType",
    "FrequencyDays", "MeterInterval", "CurrentMeterReading", "NextDueAt", "NextDueMeter",
    "LastRunAt", "Priority", "IsActive", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Time-based: ilk açılışta overdue (worker hemen WO üretsin)
('80000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-01 Aylık Plan', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 0, 30, NULL, 0, NOW() - INTERVAL '2 day', NULL, NULL, 1, true, NOW(), '127.0.0.1', false),
-- Time-based: stok yetersiz (R410A 25kg istenir, stok 15kg)
('80000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chiller-1 Zaman Bazlı Plan', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 0, 14, NULL, 0, NOW() - INTERVAL '1 day', NULL, NULL, 2, true, NOW(), '127.0.0.1', false),
-- Time-based: açık iş emri varken tekrar üretilmesin (skip existing open WO)
('80000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-03 Zaman Bazlı Plan', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 0, 30, NULL, 0, NOW() - INTERVAL '1 day', NULL, NULL, 1, true, NOW(), '127.0.0.1', false);

-- Hibrit plan için mevcut açık WO'yu bağla
UPDATE "WorkOrders"
SET "MaintenancePlanId" = '80000000-0000-0000-0000-000000000003'
WHERE "Id" = '70000000-0000-0000-0000-000000000003';

-- ============================
-- ASSET LIFECYCLE ENRICHMENT (No Empty Demo Fields)
-- ============================
UPDATE "Assets"
SET
    "AssetTag" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'AT-CHILLER-001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'AT-CHILLER-002'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'AT-AHU-001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'AT-AHU-002'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'AT-AHU-003'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'AT-FCU-001'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'AT-FCU-002'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'AT-ELEV-001'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'AT-FIRE-001'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'AT-GEN-001'
    END,
    "ItemId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN '30000000-0000-0000-0000-000000000004'
        WHEN '20000000-0000-0000-0000-000000000002' THEN '30000000-0000-0000-0000-000000000005'
        WHEN '20000000-0000-0000-0000-000000000003' THEN '30000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '30000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000005' THEN '30000000-0000-0000-0000-000000000002'
        WHEN '20000000-0000-0000-0000-000000000006' THEN '30000000-0000-0000-0000-000000000029'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '30000000-0000-0000-0000-000000000029'
        WHEN '20000000-0000-0000-0000-000000000008' THEN '30000000-0000-0000-0000-000000000026'
        WHEN '20000000-0000-0000-0000-000000000009' THEN '30000000-0000-0000-0000-000000000022'
        WHEN '20000000-0000-0000-0000-000000000010' THEN '30000000-0000-0000-0000-000000000016'
    END::uuid,
    "Condition" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 1
        WHEN '20000000-0000-0000-0000-000000000002' THEN 2
        WHEN '20000000-0000-0000-0000-000000000003' THEN 1
        WHEN '20000000-0000-0000-0000-000000000004' THEN 3
        WHEN '20000000-0000-0000-0000-000000000005' THEN 4
        WHEN '20000000-0000-0000-0000-000000000006' THEN 0
        WHEN '20000000-0000-0000-0000-000000000007' THEN 1
        WHEN '20000000-0000-0000-0000-000000000008' THEN 2
        WHEN '20000000-0000-0000-0000-000000000009' THEN 1
        WHEN '20000000-0000-0000-0000-000000000010' THEN 1
    END,
    "DepartmentId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN '90000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN '90000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000003' THEN '90000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '90000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000005' THEN '90000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000006' THEN '90000000-0000-0000-0000-000000000002'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '90000000-0000-0000-0000-000000000002'
        WHEN '20000000-0000-0000-0000-000000000008' THEN '90000000-0000-0000-0000-000000000003'
        WHEN '20000000-0000-0000-0000-000000000009' THEN '90000000-0000-0000-0000-000000000003'
        WHEN '20000000-0000-0000-0000-000000000010' THEN '90000000-0000-0000-0000-000000000003'
    END::uuid,
    "AssignedToUserId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000002' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'b0000000-0000-0000-0000-000000000002'
        WHEN '20000000-0000-0000-0000-000000000004' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000005' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000006' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'b0000000-0000-0000-0000-000000000003'
        WHEN '20000000-0000-0000-0000-000000000008' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000009' THEN NULL
        WHEN '20000000-0000-0000-0000-000000000010' THEN NULL
    END::uuid,
    "Brand" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'Carrier AquaSnap'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'Carrier AquaSnap'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'Daikin Airside'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'Daikin Airside'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'Daikin Pro'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'Alarko Carrier'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'Alarko Carrier'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'Otis Gen2'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'Siemens Cerberus'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'Aksa Power'
    END,
    "Specifications" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN '{"capacity_kw":820,"refrigerant":"R410A","voltage":"400V","phase":"3P","frequency":"50Hz"}'
        WHEN '20000000-0000-0000-0000-000000000002' THEN '{"capacity_kw":820,"refrigerant":"R410A","voltage":"400V","phase":"3P","frequency":"50Hz"}'
        WHEN '20000000-0000-0000-0000-000000000003' THEN '{"airflow_m3h":21000,"filter":"G4+F7","fan_kw":7.5,"supply_temp_c":18}'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '{"airflow_m3h":21000,"filter":"G4+F7","fan_kw":7.5,"supply_temp_c":18}'
        WHEN '20000000-0000-0000-0000-000000000005' THEN '{"airflow_m3h":26000,"filter":"G4+F9","fan_kw":11,"supply_temp_c":17}'
        WHEN '20000000-0000-0000-0000-000000000006' THEN '{"airflow_m3h":1800,"coil_rows":3,"motor_w":380}'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '{"airflow_m3h":1800,"coil_rows":3,"motor_w":380}'
        WHEN '20000000-0000-0000-0000-000000000008' THEN '{"capacity_kg":1600,"stops":5,"drive":"MRL"}'
        WHEN '20000000-0000-0000-0000-000000000009' THEN '{"loop_count":4,"address_capacity":1024,"battery_backup":"24h"}'
        WHEN '20000000-0000-0000-0000-000000000010' THEN '{"power_kva":825,"fuel":"diesel","autonomy_hours":10}'
    END,
    "PurchaseDate" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN DATE '2023-05-15'
        WHEN '20000000-0000-0000-0000-000000000002' THEN DATE '2023-05-15'
        WHEN '20000000-0000-0000-0000-000000000003' THEN DATE '2023-06-20'
        WHEN '20000000-0000-0000-0000-000000000004' THEN DATE '2023-06-20'
        WHEN '20000000-0000-0000-0000-000000000005' THEN DATE '2023-06-21'
        WHEN '20000000-0000-0000-0000-000000000006' THEN DATE '2023-07-15'
        WHEN '20000000-0000-0000-0000-000000000007' THEN DATE '2023-07-16'
        WHEN '20000000-0000-0000-0000-000000000008' THEN DATE '2022-11-01'
        WHEN '20000000-0000-0000-0000-000000000009' THEN DATE '2023-01-05'
        WHEN '20000000-0000-0000-0000-000000000010' THEN DATE '2022-04-20'
    END,
    "PurchaseCost" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 3250000.00
        WHEN '20000000-0000-0000-0000-000000000002' THEN 3250000.00
        WHEN '20000000-0000-0000-0000-000000000003' THEN 780000.00
        WHEN '20000000-0000-0000-0000-000000000004' THEN 780000.00
        WHEN '20000000-0000-0000-0000-000000000005' THEN 940000.00
        WHEN '20000000-0000-0000-0000-000000000006' THEN 185000.00
        WHEN '20000000-0000-0000-0000-000000000007' THEN 185000.00
        WHEN '20000000-0000-0000-0000-000000000008' THEN 1650000.00
        WHEN '20000000-0000-0000-0000-000000000009' THEN 420000.00
        WHEN '20000000-0000-0000-0000-000000000010' THEN 980000.00
    END,
    "SupplierId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000003' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000005' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000006' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '40000000-0000-0000-0000-000000000001'
        WHEN '20000000-0000-0000-0000-000000000008' THEN '40000000-0000-0000-0000-000000000002'
        WHEN '20000000-0000-0000-0000-000000000009' THEN '40000000-0000-0000-0000-000000000003'
        WHEN '20000000-0000-0000-0000-000000000010' THEN '40000000-0000-0000-0000-000000000003'
    END::uuid,
    "WarrantyStartDate" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN DATE '2023-06-15'
        WHEN '20000000-0000-0000-0000-000000000002' THEN DATE '2023-06-15'
        WHEN '20000000-0000-0000-0000-000000000003' THEN DATE '2023-07-01'
        WHEN '20000000-0000-0000-0000-000000000004' THEN DATE '2023-07-01'
        WHEN '20000000-0000-0000-0000-000000000005' THEN DATE '2023-07-01'
        WHEN '20000000-0000-0000-0000-000000000006' THEN DATE '2023-08-01'
        WHEN '20000000-0000-0000-0000-000000000007' THEN DATE '2023-08-01'
        WHEN '20000000-0000-0000-0000-000000000008' THEN DATE '2022-12-01'
        WHEN '20000000-0000-0000-0000-000000000009' THEN DATE '2023-01-15'
        WHEN '20000000-0000-0000-0000-000000000010' THEN DATE '2022-06-01'
    END,
    "WarrantyEndDate" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN DATE '2028-06-14'
        WHEN '20000000-0000-0000-0000-000000000002' THEN DATE '2026-04-20'
        WHEN '20000000-0000-0000-0000-000000000003' THEN DATE '2026-04-25'
        WHEN '20000000-0000-0000-0000-000000000004' THEN DATE '2026-03-15'
        WHEN '20000000-0000-0000-0000-000000000005' THEN DATE '2025-11-30'
        WHEN '20000000-0000-0000-0000-000000000006' THEN DATE '2027-07-31'
        WHEN '20000000-0000-0000-0000-000000000007' THEN DATE '2027-07-31'
        WHEN '20000000-0000-0000-0000-000000000008' THEN DATE '2025-12-01'
        WHEN '20000000-0000-0000-0000-000000000009' THEN DATE '2026-12-31'
        WHEN '20000000-0000-0000-0000-000000000010' THEN DATE '2026-05-31'
    END,
    "ParentAssetId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000006' THEN '20000000-0000-0000-0000-000000000003'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '20000000-0000-0000-0000-000000000004'
        ELSE NULL
    END::uuid,
    "Description" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'B1 mekanik odada ana soğutma yükünü taşıyan primer chiller ünitesi.'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'Yedek/tepe yük destek amaçlı ikinci chiller ünitesi.'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'Zemin kat taze hava ve dönüş hava karışımını yöneten AHU.'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '1. kat mağaza koridoru iklimlendirmesi için AHU.'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'Food court alanı yüksek debili havalandırma AHU.'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'Zemin kat mağaza hattı fan coil terminal ünitesi.'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '1. kat mağaza hattı fan coil terminal ünitesi.'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'Ana bina müşteri taşıma asansörü.'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'Adresli yangın algılama merkezi kontrol paneli.'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'Kesinti anında acil yükleri besleyen dizel jeneratör.'
    END,
    "Notes" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'Performans trendi stabil, vibrasyon sınır içinde.'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'Nisan sonunda garanti bitiyor, yenileme teklifi bekleniyor.'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'Teknisyen Ahmet üzerinde aktif zimmet.'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'Kayış aşınması nedeniyle bir sonraki bakımda değişim planlı.'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'Arıza kaydı açık, gürültü seviyesi yüksek.'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'Depodan yeni çıkış, kurulum öncesi kalite kontrol tamamlandı.'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'Teknisyen Zeynep üzerinde zimmetli mobil müdahale ünitesi.'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'Kısa süreli kullanım dışı, modernizasyon planına alındı.'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'Panel aktif, cihaz loop testi aylık yapılıyor.'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'Yedek güç sistemi aktif, emisyon kontrolü tamamlandı.'
    END,
    "Barcode" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'BC-AT-CHILLER-001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'BC-AT-CHILLER-002'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'BC-AT-AHU-001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'BC-AT-AHU-002'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'BC-AT-AHU-003'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'BC-AT-FCU-001'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'BC-AT-FCU-002'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'BC-AT-ELEV-001'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'BC-AT-FIRE-001'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'BC-AT-GEN-001'
    END,
    "QrCode" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'QR://asset/AT-CHILLER-001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'QR://asset/AT-CHILLER-002'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'QR://asset/AT-AHU-001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'QR://asset/AT-AHU-002'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'QR://asset/AT-AHU-003'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'QR://asset/AT-FCU-001'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'QR://asset/AT-FCU-002'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'QR://asset/AT-ELEV-001'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'QR://asset/AT-FIRE-001'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'QR://asset/AT-GEN-001'
    END,
    "NfcTagId" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 'NFC-CH-001'
        WHEN '20000000-0000-0000-0000-000000000002' THEN 'NFC-CH-002'
        WHEN '20000000-0000-0000-0000-000000000003' THEN 'NFC-AHU-001'
        WHEN '20000000-0000-0000-0000-000000000004' THEN 'NFC-AHU-002'
        WHEN '20000000-0000-0000-0000-000000000005' THEN 'NFC-AHU-003'
        WHEN '20000000-0000-0000-0000-000000000006' THEN 'NFC-FCU-001'
        WHEN '20000000-0000-0000-0000-000000000007' THEN 'NFC-FCU-002'
        WHEN '20000000-0000-0000-0000-000000000008' THEN 'NFC-ELV-001'
        WHEN '20000000-0000-0000-0000-000000000009' THEN 'NFC-FIRE-001'
        WHEN '20000000-0000-0000-0000-000000000010' THEN 'NFC-GEN-001'
    END,
    "Status" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN 0
        WHEN '20000000-0000-0000-0000-000000000002' THEN 2
        WHEN '20000000-0000-0000-0000-000000000003' THEN 6
        WHEN '20000000-0000-0000-0000-000000000004' THEN 3
        WHEN '20000000-0000-0000-0000-000000000005' THEN 1
        WHEN '20000000-0000-0000-0000-000000000006' THEN 5
        WHEN '20000000-0000-0000-0000-000000000007' THEN 6
        WHEN '20000000-0000-0000-0000-000000000008' THEN 4
        WHEN '20000000-0000-0000-0000-000000000009' THEN 0
        WHEN '20000000-0000-0000-0000-000000000010' THEN 0
    END,
    "Metadata" = CASE "Id"
        WHEN '20000000-0000-0000-0000-000000000001' THEN '{"criticality":"high","energyClass":"A","maintenanceStrategy":"predictive"}'
        WHEN '20000000-0000-0000-0000-000000000002' THEN '{"criticality":"high","energyClass":"A","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000003' THEN '{"criticality":"medium","energyClass":"B","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000004' THEN '{"criticality":"medium","energyClass":"B","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000005' THEN '{"criticality":"high","energyClass":"C","maintenanceStrategy":"corrective"}'
        WHEN '20000000-0000-0000-0000-000000000006' THEN '{"criticality":"low","energyClass":"A","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000007' THEN '{"criticality":"low","energyClass":"A","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000008' THEN '{"criticality":"high","safety":"regulated","maintenanceStrategy":"contract"}'
        WHEN '20000000-0000-0000-0000-000000000009' THEN '{"criticality":"high","safety":"lifeSafety","maintenanceStrategy":"preventive"}'
        WHEN '20000000-0000-0000-0000-000000000010' THEN '{"criticality":"high","backupPower":"yes","maintenanceStrategy":"preventive"}'
    END
WHERE "Id" IN (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000010'
);

-- Asset timeline seed (rich demo history)
INSERT INTO "AssetHistories"
("Id","AssetId","ActionType","OldValue","NewValue","PerformedBy","PerformedAt","ReferenceType","ReferenceId","Note","TenantId","CreatedAt","ChangeIp","IsDeleted")
VALUES
('81000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',0,NULL,'{"status":0,"locationId":"10000000-0000-0000-0000-000000000020"}','b0000000-0000-0000-0000-000000000002',NOW() - INTERVAL '180 day','asset','20000000-0000-0000-0000-000000000001','Asset created and commissioned','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',2,'{"status":0}','{"status":2}','b0000000-0000-0000-0000-000000000002',NOW() - INTERVAL '20 day','work_order','70000000-0000-0000-0000-000000000003','Status changed to maintenance for preventive service','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003',4,'{"assignedToUserId":null}','{"assignedToUserId":"b0000000-0000-0000-0000-000000000002"}','b0000000-0000-0000-0000-000000000004',NOW() - INTERVAL '7 day','assignment','20000000-0000-0000-0000-000000000003','Assigned to technician Ahmet for route inspections','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000005',2,'{"status":0}','{"status":1}','b0000000-0000-0000-0000-000000000003',NOW() - INTERVAL '3 day','work_order','70000000-0000-0000-0000-000000000002','Noise fault detected at Food Court AHU','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000004',8,'{"warrantyEndDate":"2026-03-01"}','{"warrantyEndDate":"2026-03-15"}','b0000000-0000-0000-0000-000000000004',NOW() - INTERVAL '5 day','contract','50000000-0000-0000-0000-000000000001','Warranty extension applied by supplier','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000006',3,'{"locationId":"10000000-0000-0000-0000-000000000022"}','{"locationId":"10000000-0000-0000-0000-000000000011"}','b0000000-0000-0000-0000-000000000003',NOW() - INTERVAL '2 day','transfer','20000000-0000-0000-0000-000000000006','Transferred from depot to ground floor for installation','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000007',10,'{"parentAssetId":null}','{"parentAssetId":"20000000-0000-0000-0000-000000000004"}','b0000000-0000-0000-0000-000000000004',NOW() - INTERVAL '10 day','structure','20000000-0000-0000-0000-000000000004','Linked as child terminal unit under AHU-02','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000009',6,NULL,'{"maintenancePlanId":"80000000-0000-0000-0000-000000000001"}','b0000000-0000-0000-0000-000000000002',NOW() - INTERVAL '14 day','maintenance_plan','80000000-0000-0000-0000-000000000001','Fire panel linked to monthly checklist','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('81000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000010',7,NULL,'{"workOrderId":"70000000-0000-0000-0000-000000000009"}','b0000000-0000-0000-0000-000000000004',NOW() - INTERVAL '6 day','work_order','70000000-0000-0000-0000-000000000009','Generator predictive maintenance completed','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false)
ON CONFLICT DO NOTHING;

-- Asset movement seed (assignment / transfer / return / status)
INSERT INTO "AssetMovements"
("Id","AssetId","MovementType","FromLocationId","ToLocationId","FromUserId","ToUserId","Reason","MovedBy","MovedAt","Notes","TenantId","CreatedAt","ChangeIp","IsDeleted")
VALUES
('82000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',1,'10000000-0000-0000-0000-000000000024','10000000-0000-0000-0000-000000000024',NULL,'b0000000-0000-0000-0000-000000000002','route_assignment','b0000000-0000-0000-0000-000000000004',NOW() - INTERVAL '7 day','Assigned for daily AHU route inspection','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('82000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000006',0,'10000000-0000-0000-0000-000000000022','10000000-0000-0000-0000-000000000011',NULL,NULL,'installation_transfer','b0000000-0000-0000-0000-000000000003',NOW() - INTERVAL '2 day','Moved from depot to ground floor installation zone','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('82000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000007',2,'10000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003',NULL,'temporary_return','b0000000-0000-0000-0000-000000000003',NOW() - INTERVAL '1 day','Returned after shift completion','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('82000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002',3,'10000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000020',NULL,NULL,'preventive_maintenance_window','b0000000-0000-0000-0000-000000000002',NOW() - INTERVAL '20 day','Status switched to IN_MAINTENANCE','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('82000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005',4,'10000000-0000-0000-0000-000000000024','10000000-0000-0000-0000-000000000023','b0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003','fault_checkout','b0000000-0000-0000-0000-000000000003',NOW() - INTERVAL '3 day','Checked out for fault diagnosis in food court','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false),
('82000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000005',5,'10000000-0000-0000-0000-000000000023','10000000-0000-0000-0000-000000000024','b0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002','fault_checkin','b0000000-0000-0000-0000-000000000002',NOW() - INTERVAL '2 day','Checked in after diagnostics','a1b2c3d4-e5f6-7890-abcd-ef1234567890',NOW(),'127.0.0.1',false)
ON CONFLICT DO NOTHING;

RESET search_path;


