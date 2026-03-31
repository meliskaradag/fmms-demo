-- FMMS Demo Seed Data
-- AVM (Shopping Mall) Klima Bakım Senaryosu
-- Tüm demo kullanıcıları: admin@abc-avm.com, ahmet@abc-avm.com (teknisyen), zeynep@abc-avm.com (stok), mehmet@abc-avm.com (yönetici)

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
INSERT INTO "StockCards" ("Id", "TenantId", "StockNumber", "Name", "Category", "Unit", "MinStockLevel", "UnitPrice", "Currency", "CodeSource", "ToleranceValue", "ToleranceType", "IsActive", "CreatedAt", "ChangeIp", "IsDeleted")
VALUES
('30000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-001', 'HVAC Filtre 592x592x48mm', 'Filtre', 'adet', 10, 450.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-002', 'HEPA Filtre H13', 'Filtre', 'adet', 5, 1200.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BLT-001', 'V-Kayış A68', 'Kayış', 'adet', 4, 320.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-REF-001', 'R410A Soğutucu Gaz', 'Soğutucu Gaz', 'kg', 20, 850.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-OIL-001', 'Kompresör Yağı POE 68', 'Yağ', 'litre', 10, 680.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-CLN-001', 'Klima Temizleme Spreyi', 'Temizlik', 'adet', 15, 120.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BRG-001', 'Fan Motor Rulmanı 6205-2RS', 'Rulman', 'adet', 6, 280.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-VLV-001', 'Genleşme Vanası TXV-R410A', 'Vana', 'adet', 3, 1450.00, 'TRY', 0, 0, 'absolute', true, NOW(), '127.0.0.1', false);

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
('31000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000022', 2, NOW(), '127.0.0.1', false);

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
('70000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-J1K2L3', 0, 2, 0, 'Zemin Kat Fan Coil Arızası - Soğutma Yapmiyor', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', NULL, NULL, NULL, '2026-03-27 12:00:00', '2026-03-26 08:30:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-M4N5O6', 0, 3, 0, 'Food Court Havalandırma Gürültü Şikayeti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', NULL, NULL, NULL, '2026-03-26 18:00:00', '2026-03-26 10:15:00', '127.0.0.1', false),
-- Overdue WO
('70000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260320-P7Q8R9', 0, 2, 1, '1. Kat Fan Coil Kaçak Tespiti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '2026-03-22 08:00:00', NULL, NULL, '2026-03-24 08:00:00', '2026-03-20 16:00:00', '127.0.0.1', false),
-- More completed WOs for chart data
('70000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260215-S1T2U3', 1, 0, 4, 'AHU-02 Aylık Bakım - Şubat', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '2026-02-15 08:00:00', '2026-02-15 08:20:00', '2026-02-15 10:00:00', '2026-02-16 08:00:00', '2026-02-10 10:00:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260210-V4W5X6', 0, 1, 4, 'Chiller #2 Soğutucu Gaz Kaçağı Onarımı', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '2026-02-10 14:00:00', '2026-02-10 14:30:00', '2026-02-10 18:00:00', '2026-02-11 14:00:00', '2026-02-10 11:00:00', '127.0.0.1', false);

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
('71000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-10 12:00:00', '127.0.0.1', false);

RESET search_path;
