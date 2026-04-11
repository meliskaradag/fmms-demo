-- FMMS Demo Seed Data
-- AVM (Shopping Mall) Klima Bakım Senaryosu
-- Tum demo kullanicilari: admin@abc-avm.com, ahmet@abc-avm.com (teknisyen), zeynep@abc-avm.com (stok), mehmet@abc-avm.com (yonetici)

SET client_encoding TO 'UTF8';
SET search_path TO public;

-- Railway run marker (if you don't see this row in results, full script did not run)
SELECT 'SEED_START' AS "Marker", NOW() AS "RunAt";

-- ============================
-- TENANT (public schema)
-- ============================
INSERT INTO "Tenants" (
    "Id", "Name", "LegalName", "TradeName", "Slug", "SchemaName",
    "TaxOffice", "TaxNumber", "BillingAddress", "BillingCity", "BillingCountry",
    "ContactEmail", "ContactPhone", "SubscriptionPlan", "IsActive", "Settings"
)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'ABC AVM',
    'ABC Alışveriş Merkezi Yönetim A.S.',
    'ABC AVM',
    'abc-avm',
    'tenant_abc_avm',
    'Kadıköy V.D.',
    '1234567890',
    'Bagdat Cad. No:123',
    'Istanbul',
    'TR',
    'info@abc-avm.com',
    '+90 216 555 0000',
    'enterprise',
    true,
    '{}'
) ON CONFLICT DO NOTHING;

-- ============================
-- LOCATIONS
-- ============================
-- LocationType: Facility=0, Building=1, Floor=2, Section=3, Room=4, CommonArea=5

-- Ana Bina
INSERT INTO "Locations" (
    "Id", "TenantId", "Name", "Type", "ParentId",
    "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd",
    "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('10000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ABC AVM Ana Bina', 0, NULL, false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- Katlar
INSERT INTO "Locations" (
    "Id", "TenantId", "Name", "Type", "ParentId",
    "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd",
    "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('10000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bodrum Kat (B1)', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zemin Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1. Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2. Kat', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Çatı Katı (Mekanik)', 1, '10000000-0000-0000-0000-000000000001', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- Özel Alanlar
INSERT INTO "Locations" (
    "Id", "TenantId", "Name", "Type", "ParentId",
    "IsLinear", "GpsLatStart", "GpsLngStart", "GpsLatEnd", "GpsLngEnd",
    "IsCommonArea", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('10000000-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mekanik Oda - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Elektrik Odasi - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Depo - B1', 2, '10000000-0000-0000-0000-000000000010', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Food Court Alanı', 2, '10000000-0000-0000-0000-000000000013', false, 0, 0, 0, 0, true, NOW(), '127.0.0.1', false),
('10000000-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU Odasi - Çatı', 2, '10000000-0000-0000-0000-000000000014', false, 0, 0, 0, 0, false, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- ASSETS (Klima, fan coil, chiller vb.)
-- ============================
-- AssetStatus: Active=0, Broken=1, InMaintenance=2, Retired=3, Disposed=4, InStock=5, Assigned=6
-- AssetCondition: New=0, Good=1, Fair=2, Poor=3, Damaged=4

INSERT INTO "Assets" (
    "Id", "TenantId", "AssetNumber", "AssetTag", "Name", "Category",
    "LocationId", "Status", "Condition",
    "Manufacturer", "Model", "SerialNumber", "InstallationDate", "BatchNumber",
    "Brand", "Barcode", "QrCode", "NfcTagId",
    "ItemId", "DepartmentId", "AssignedToUserId", "ParentAssetId",
    "PurchaseDate", "PurchaseCost", "SupplierId",
    "WarrantyStartDate", "WarrantyEndDate",
    "Specifications", "Description", "Notes", "Metadata",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Chiller #1: Active, Good condition
('20000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-HVAC-001', 'AT-CHILLER-001', 'Ana Chiller Ünite #1', 'HVAC - Chiller',
 '10000000-0000-0000-0000-000000000020', 0, 1,
 'Carrier', '30XA-0802', 'CR-2023-001', '2023-06-15', 'B2023-01',
 'Carrier AquaSnap', 'BC-AT-CHILLER-001', 'QR://asset/AT-CHILLER-001', 'NFC-CH-001',
 '30000000-0000-0000-0000-000000000004', '90000000-0000-0000-0000-000000000001', NULL, NULL,
 '2023-05-15', 3250000.00, '40000000-0000-0000-0000-000000000001',
 '2023-06-15', '2028-06-14',
 '{"capacity_kw":820,"refrigerant":"R410A","voltage":"400V","phase":"3P","frequency":"50Hz"}',
 'B1 mekanik odada ana soğutma yükünü taşıyan primer chiller ünitesi.',
 'Performans trendi stabil, vibrasyon sınır içinde.',
 '{"criticality":"high","energyClass":"A","maintenanceStrategy":"predictive"}',
 NOW(), '127.0.0.1', false),

-- Chiller #2: InMaintenance, Fair condition
('20000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-HVAC-002', 'AT-CHILLER-002', 'Ana Chiller Ünite #2', 'HVAC - Chiller',
 '10000000-0000-0000-0000-000000000020', 2, 2,
 'Carrier', '30XA-0802', 'CR-2023-002', '2023-06-15', 'B2023-01',
 'Carrier AquaSnap', 'BC-AT-CHILLER-002', 'QR://asset/AT-CHILLER-002', 'NFC-CH-002',
 '30000000-0000-0000-0000-000000000005', '90000000-0000-0000-0000-000000000001', NULL, NULL,
 '2023-05-15', 3250000.00, '40000000-0000-0000-0000-000000000001',
 '2023-06-15', '2026-04-20',
 '{"capacity_kw":820,"refrigerant":"R410A","voltage":"400V","phase":"3P","frequency":"50Hz"}',
 'Yedek/tepe yük destek amaçlı ikinci chiller ünitesi.',
 'Nisan sonunda garanti bitiyor, yenileme teklifi bekleniyor.',
 '{"criticality":"high","energyClass":"A","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- AHU-01: Assigned, Good condition
('20000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-HVAC-003', 'AT-AHU-001', 'AHU-01 (Zemin Kat)', 'HVAC - AHU',
 '10000000-0000-0000-0000-000000000024', 6, 1,
 'Daikin', 'AHU-150', 'DK-2023-003', '2023-07-01', 'B2023-02',
 'Daikin Airside', 'BC-AT-AHU-001', 'QR://asset/AT-AHU-001', 'NFC-AHU-001',
 '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NULL,
 '2023-06-20', 780000.00, '40000000-0000-0000-0000-000000000001',
 '2023-07-01', '2026-04-25',
 '{"airflow_m3h":21000,"filter":"G4+F7","fan_kw":7.5,"supply_temp_c":18}',
 'Zemin kat taze hava ve dönüş hava karışımını yöneten AHU.',
 'Teknisyen Ahmet üzerinde aktif zimmet.',
 '{"criticality":"medium","energyClass":"B","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- AHU-02: Retired, Poor condition
('20000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-HVAC-004', 'AT-AHU-002', 'AHU-02 (1. Kat)', 'HVAC - AHU',
 '10000000-0000-0000-0000-000000000024', 3, 3,
 'Daikin', 'AHU-150', 'DK-2023-004', '2023-07-01', 'B2023-02',
 'Daikin Airside', 'BC-AT-AHU-002', 'QR://asset/AT-AHU-002', 'NFC-AHU-002',
 '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', NULL, NULL,
 '2023-06-20', 780000.00, '40000000-0000-0000-0000-000000000001',
 '2023-07-01', '2026-03-15',
 '{"airflow_m3h":21000,"filter":"G4+F7","fan_kw":7.5,"supply_temp_c":18}',
 '1. kat mağaza koridoru iklimlendirmesi için AHU.',
 'Kayış aşınması nedeniyle bir sonraki bakımda değişim planlı.',
 '{"criticality":"medium","energyClass":"B","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- AHU-03: Broken, Damaged condition
('20000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-HVAC-005', 'AT-AHU-003', 'AHU-03 (2. Kat / Food Court)', 'HVAC - AHU',
 '10000000-0000-0000-0000-000000000024', 1, 4,
 'Daikin', 'AHU-200', 'DK-2023-005', '2023-07-01', 'B2023-02',
 'Daikin Pro', 'BC-AT-AHU-003', 'QR://asset/AT-AHU-003', 'NFC-AHU-003',
 '30000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', NULL, NULL,
 '2023-06-21', 940000.00, '40000000-0000-0000-0000-000000000001',
 '2023-07-01', '2025-11-30',
 '{"airflow_m3h":26000,"filter":"G4+F9","fan_kw":11,"supply_temp_c":17}',
 'Food court alanı yüksek debili havalandirma AHU.',
 'Arıza kaydı açık, gürültü seviyesi yüksek.',
 '{"criticality":"high","energyClass":"C","maintenanceStrategy":"corrective"}',
 NOW(), '127.0.0.1', false),

-- Fan Coil Zemin: InStock, New condition
('20000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-FC-001', 'AT-FCU-001', 'Fan Coil Ünite - Zemin Z01', 'HVAC - Fan Coil',
 '10000000-0000-0000-0000-000000000011', 5, 0,
 'Alarko', 'FCU-400', 'AL-2023-010', '2023-08-01', 'B2023-03',
 'Alarko Carrier', 'BC-AT-FCU-001', 'QR://asset/AT-FCU-001', 'NFC-FCU-001',
 '30000000-0000-0000-0000-000000000029', '90000000-0000-0000-0000-000000000002', NULL, '20000000-0000-0000-0000-000000000003',
 '2023-07-15', 185000.00, '40000000-0000-0000-0000-000000000001',
 '2023-08-01', '2027-07-31',
 '{"airflow_m3h":1800,"coil_rows":3,"motor_w":380}',
 'Zemin kat mağaza hatti fan coil terminal ünitesi.',
 'Depodan yeni çıkış, kurulum öncesi kalite kontrol tamamlandı.',
 '{"criticality":"low","energyClass":"A","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- Fan Coil 1.Kat: Assigned, Good condition
('20000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-FC-002', 'AT-FCU-002', 'Fan Coil Ünite - 1.Kat K01', 'HVAC - Fan Coil',
 '10000000-0000-0000-0000-000000000012', 6, 1,
 'Alarko', 'FCU-400', 'AL-2023-011', '2023-08-01', 'B2023-03',
 'Alarko Carrier', 'BC-AT-FCU-002', 'QR://asset/AT-FCU-002', 'NFC-FCU-002',
 '30000000-0000-0000-0000-000000000029', '90000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004',
 '2023-07-16', 185000.00, '40000000-0000-0000-0000-000000000001',
 '2023-08-01', '2027-07-31',
 '{"airflow_m3h":1800,"coil_rows":3,"motor_w":380}',
 '1. kat mağaza hatti fan coil terminal ünitesi.',
 'Teknisyen Zeynep üzerinde zimmetli mobil müdahale ünitesi.',
 '{"criticality":"low","energyClass":"A","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- Asansor: Disposed, Fair condition
('20000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-ELV-001', 'AT-ELEV-001', 'Asansor #1', 'Asansor',
 '10000000-0000-0000-0000-000000000001', 4, 2,
 'Otis', 'Gen2-MR', 'OT-2022-001', '2022-12-01', 'B2022-01',
 'Otis Gen2', 'BC-AT-ELEV-001', 'QR://asset/AT-ELEV-001', 'NFC-ELV-001',
 '30000000-0000-0000-0000-000000000026', '90000000-0000-0000-0000-000000000003', NULL, NULL,
 '2022-11-01', 1650000.00, '40000000-0000-0000-0000-000000000002',
 '2022-12-01', '2025-12-01',
 '{"capacity_kg":1600,"stops":5,"drive":"MRL"}',
 'Ana bina müşteri taşıma asansoru.',
 'Kısa süreli kullanım dışı, modernizasyon planına alındı.',
 '{"criticality":"high","safety":"regulated","maintenanceStrategy":"contract"}',
 NOW(), '127.0.0.1', false),

-- Yangın Algılama: Active, Good condition
('20000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-FIRE-001', 'AT-FIRE-001', 'Yangın Algılama Paneli', 'Yangın Güvenlik',
 '10000000-0000-0000-0000-000000000021', 0, 1,
 'Siemens', 'FC-2060', 'SM-2023-001', '2023-01-15', 'B2023-04',
 'Siemens Cerberus', 'BC-AT-FIRE-001', 'QR://asset/AT-FIRE-001', 'NFC-FIRE-001',
 '30000000-0000-0000-0000-000000000022', '90000000-0000-0000-0000-000000000003', NULL, NULL,
 '2023-01-05', 420000.00, '40000000-0000-0000-0000-000000000003',
 '2023-01-15', '2026-12-31',
 '{"loop_count":4,"address_capacity":1024,"battery_backup":"24h"}',
 'Adresli yangın algılama merkezi kontrol paneli.',
 'Panel aktif, cihaz loop testi aylık yapılıyor.',
 '{"criticality":"high","safety":"lifeSafety","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false),

-- Jeneratör: Active, Good condition
('20000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'AST-GEN-001', 'AT-GEN-001', 'Jeneratör', 'Elektrik',
 '10000000-0000-0000-0000-000000000021', 0, 1,
 'Aksa', 'APD-825', 'AK-2022-001', '2022-06-01', 'B2022-02',
 'Aksa Power', 'BC-AT-GEN-001', 'QR://asset/AT-GEN-001', 'NFC-GEN-001',
 '30000000-0000-0000-0000-000000000016', '90000000-0000-0000-0000-000000000003', NULL, NULL,
 '2022-04-20', 980000.00, '40000000-0000-0000-0000-000000000003',
 '2022-06-01', '2026-05-31',
 '{"power_kva":825,"fuel":"diesel","autonomy_hours":10}',
 'Kesinti anında acil yükleri besleyen dizel jeneratör.',
 'Yedek güç sistemi aktif, emisyon kontrolü tamamlandı.',
 '{"criticality":"high","backupPower":"yes","maintenanceStrategy":"preventive"}',
 NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- STOCK CARDS (Bakım malzemeleri)
-- ============================
-- CodeSource: Breakdown=0, Manufacturer=1, OriginalBarcode=2
-- StockNodeType: StockGroup=0, StockSubgroup=1, StockCard=2

INSERT INTO "StockCards" (
    "Id", "TenantId", "StockNumber", "Name", "Category", "Unit",
    "MinStockLevel", "UnitPrice", "Currency", "CodeSource",
    "ToleranceValue", "ToleranceType", "IsActive",
    "ParentId", "HierarchyLevel", "HierarchyPath", "NodeType", "SortOrder",
    "UsesVariants", "BarcodeRequired", "BrandRequired",
    "SerialTrackingEnabled", "LotTrackingEnabled", "ExpiryTrackingEnabled",
    "IsVariantBased",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Root catalog
('30000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001', 'Tesis Bakım Sarf Envanteri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, NULL, 0, 'Tesis Bakım Sarf Envanteri', 0, 0, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
-- Level 1 groups
('30000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01', 'HVAC Sarf Malzemeleri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri', 0, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02', 'Elektrik ve Güç Sistemleri', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri', 0, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-03', 'Yangın Güvenlik Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı', 0, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-04', 'Su ve Sıhhi Tesisat', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000009', 1, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat', 0, 4, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
-- Level 2 subgroups
('30000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-01', 'Filtreler', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler', 1, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-02', 'Kimyasallar ve Yağlar', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar', 1, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-01-03', 'Mekanik Aktarma ve Vana', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000010', 2, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana', 1, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02-01', 'Jeneratör Bakım Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Jeneratör Bakım Sarfı', 1, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-02-02', 'Aydınlatma Sarfı', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Aydınlatma Sarfı', 1, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-03-01', 'Algılama ve Bildirim', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000017', 2, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim', 1, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INV-CAT-001-04-01', 'Pompa ve Hidrofor', 'Katalog', 'adet', 0, 0.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000019', 2, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor', 1, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
-- Level 3 stock cards (actual items)
('30000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-001', 'AHU Panel Filtre 592x592x48mm', 'Filtre', 'adet', 10, 450.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > AHU Panel Filtre 592x592x48mm', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-002', 'AHU HEPA Filtre H13', 'Filtre', 'adet', 5, 1200.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > AHU HEPA Filtre H13', 2, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BLT-001', 'Fan Kayışi A68', 'Kayış', 'adet', 4, 320.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Fan Kayışi A68', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-REF-001', 'R410A Soğutucu Gaz', 'Soğutucu Gaz', 'kg', 20, 850.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > R410A Soğutucu Gaz', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-OIL-001', 'Kompresör Yağı POE 68', 'Yağ', 'litre', 10, 680.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Kompresör Yağı POE 68', 2, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-CLN-001', 'Evaporator Temizleme Spreyi', 'Temizlik', 'adet', 15, 120.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Evaporator Temizleme Spreyi', 2, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-BRG-001', 'Fan Motor Rulmanı 6205-2RS', 'Rulman', 'adet', 6, 280.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Fan Motor Rulmanı 6205-2RS', 2, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-VLV-001', 'Genleşme Vanasi TXV-R410A', 'Vana', 'adet', 3, 1450.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000013', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Mekanik Aktarma ve Vana > Genleşme Vanasi TXV-R410A', 2, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-GEN-001', 'Jeneratör Yağ Filtresi LF-9009', 'Filtre', 'adet', 2, 390.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000015', 3, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Jeneratör Bakım Sarfı > Jeneratör Yağ Filtresi LF-9009', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FIRE-001', 'Adresli Duman Dedektörü', 'Yangın', 'adet', 12, 980.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000018', 3, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim > Adresli Duman Dedektörü', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FIRE-002', 'Siren Flaşör 24V', 'Yangın', 'adet', 8, 760.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000018', 3, 'Tesis Bakım Sarf Envanteri > Yangın Güvenlik Sarfı > Algılama ve Bildirim > Siren Flaşör 24V', 2, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-PMP-001', 'Hidrofor Mekanik Salmastra Seti', 'Pompa', 'set', 3, 1150.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000020', 3, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor > Hidrofor Mekanik Salmastra Seti', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000025', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-PMP-002', 'Sirkülasyon Pompası Kaplin Lastiği', 'Pompa', 'adet', 6, 210.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000020', 3, 'Tesis Bakım Sarf Envanteri > Su ve Sıhhi Tesisat > Pompa ve Hidrofor > Sirkülasyon Pompası Kaplin Lastiği', 2, 2, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000026', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-ELC-001', 'Kontaktor 32A 3P', 'Elektrik', 'adet', 10, 340.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000014', 2, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Kontaktor 32A 3P', 2, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000027', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-ELC-002', 'LED Panel Sürücüsü 36W', 'Elektrik', 'adet', 10, 180.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000021', 3, 'Tesis Bakım Sarf Envanteri > Elektrik ve Güç Sistemleri > Aydınlatma Sarfı > LED Panel Sürücüsü 36W', 2, 1, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000028', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-HVAC-001', 'Kondenser Coil Temizleyici 5L', 'Kimyasal', 'adet', 4, 540.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000012', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Kimyasallar ve Yağlar > Kondenser Coil Temizleyici 5L', 2, 4, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false),
('30000000-0000-0000-0000-000000000029', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STK-FLT-003', 'Fan Coil On Filtre G4', 'Filtre', 'adet', 20, 90.00, 'TRY', 0, 0, 'absolute', true, '30000000-0000-0000-0000-000000000011', 3, 'Tesis Bakım Sarf Envanteri > HVAC Sarf Malzemeleri > Filtreler > Fan Coil On Filtre G4', 2, 3, false, false, false, false, false, false, false, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- STOCK BALANCES (Depo: B1 Depo lokasyonu)
-- ============================
INSERT INTO "StockBalances" (
    "Id", "TenantId", "StockCardId", "LocationId",
    "CurrentStock", "QuantityOnHand", "ReservedQuantity", "AvailableQuantity",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('31000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 25, 25, 0, 25, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000022', 8, 8, 0, 8, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000022', 12, 12, 0, 12, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000022', 15, 15, 0, 15, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000022', 8, 8, 0, 8, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000022', 30, 30, 0, 30, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000022', 3, 3, 0, 3, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000022', 2, 2, 0, 2, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000022', 5, 5, 0, 5, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000022', 18, 18, 0, 18, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000022', 11, 11, 0, 11, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000022', 4, 4, 0, 4, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000022', 9, 9, 0, 9, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000022', 14, 14, 0, 14, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000022', 22, 22, 0, 22, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000022', 7, 7, 0, 7, NOW(), '127.0.0.1', false),
('31000000-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000022', 35, 35, 0, 35, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- VENDORS
-- ============================
-- VendorType: Manufacturer=0, ServiceProvider=1, Supplier=2

INSERT INTO "Vendors" (
    "Id", "TenantId", "TradeName", "InvoiceName", "ContactPerson", "Phone", "Email",
    "VendorType", "Rating", "ContractStart", "ContractEnd",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('40000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'KlimaTek Muhendislik', 'KlimaTek Muh. Hiz. Ltd. Sti.', 'Ali Yilmaz', '+90 532 555 1111', 'ali@klimatek.com', 0, 4.5, '2024-01-01', '2026-12-31', NOW(), '127.0.0.1', false),
('40000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Asansor Bakım A.S.', 'Asansor Bakım ve Servis A.S.', 'Fatma Demir', '+90 533 555 2222', 'fatma@asansor-bakım.com', 0, 4.2, '2024-03-01', '2026-02-28', NOW(), '127.0.0.1', false),
('40000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ElektroSistem', 'ElektroSistem Enerji San. Tic. A.S.', 'Hasan Kaya', '+90 534 555 3333', 'hasan@elektrosistem.com', 0, 4.0, '2024-06-01', '2026-05-31', NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- SERVICE AGREEMENTS
-- ============================
-- AgreementStatus: Active=0, Expired=1, Cancelled=2

INSERT INTO "ServiceAgreements" (
    "Id", "TenantId", "VendorId", "AgreementNumber", "Title", "ScopeDescription",
    "StartDate", "EndDate", "AutoRenew", "SlaResponseHours", "SlaResolutionHours",
    "Cost", "Currency", "Status", "CoveredAssetIds", "CoveredMaintTypes",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('50000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000001', 'SA-2024-001', 'HVAC Yıllık Bakım Sözleşmesi', 'Tum klima, AHU ve chiller ünitelerinin yıllık periyodik bakımi.', '2024-01-01', '2026-12-31', true, 4, 24, 480000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000001","20000000-0000-0000-0000-000000000002","20000000-0000-0000-0000-000000000003","20000000-0000-0000-0000-000000000004","20000000-0000-0000-0000-000000000005"]', '["Preventive","Corrective"]', NOW(), '127.0.0.1', false),
('50000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000002', 'SA-2024-002', 'Asansor Bakım Sözleşmesi', 'Tum asansorlerin aylik periyodik bakımi ve acil ariza müdahale hizmeti.', '2024-03-01', '2026-02-28', true, 2, 8, 120000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000008"]', '["Preventive","Corrective"]', NOW(), '127.0.0.1', false),
('50000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '40000000-0000-0000-0000-000000000003', 'SA-2024-003', 'Elektrik Tesisat Bakım Sözleşmesi', 'Jeneratör, UPS, pano ve tesisat bakımi.', '2024-06-01', '2026-05-31', false, 4, 48, 96000.00, 'TRY', 0, '["20000000-0000-0000-0000-000000000010"]', '["Preventive"]', NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- MAINTENANCE CARDS
-- ============================
-- MaintenanceLevel: L1User=0, L2Technician=1, L3External=2

INSERT INTO "MaintenanceCards" (
    "Id", "TenantId", "Name", "AssetCategory", "Description",
    "EstimatedDuration", "Level", "DefaultPeriodDays", "IsTemplate",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('60000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU Aylik Periyodik Bakım', 'HVAC - AHU', 'AHU ünitelerinin aylik düzenli bakım prosedürü. Filtre kontrolü, kayis kontrolü, yatak kontrolü.', '02:00:00', 1, 30, true, NOW(), '127.0.0.1', false),
('60000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chiller 3 Aylik Bakım', 'HVAC - Chiller', 'Chiller ünitelerinin 3 aylik kapsamli bakımi. Soğutucu gaz kontrolü, kompresor yaği kontrolü, kondenser temizligi.', '04:00:00', 2, 90, true, NOW(), '127.0.0.1', false),
('60000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fan Coil Ünite Bakım', 'HVAC - Fan Coil', 'Fan coil ünitelerinin filtre değişimi ve genel kontrol.', '00:45:00', 0, 30, true, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- Bakım Karti Adimlari - AHU Aylik
-- StepStatus: Mandatory=0, Optional=1, NotApplicable=2

INSERT INTO "MaintenanceCardSteps" (
    "Id", "TenantId", "CardId", "StepOrder", "Instruction", "StepStatus", "EstimatedMinutes",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('61000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 1, 'Üniteyi kapatin ve enerji kesildigi dogrulayin', 0, 5, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 2, 'Filtreleri cikartin ve kirlilik seviyesini kontrol edin. Fotograf cekin.', 0, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 3, 'Filtreleri temizleyin veya yenisiyle degistirin', 0, 20, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 4, 'V-Kayış gerginligini kontrol edin. Asinma varsa degistirin', 0, 15, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 5, 'Fan motoru rulmanlarini dinleyin ve vibrasyon kontrolü yapin', 0, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 6, 'Damper mekanizmasini kontrol edin', 1, 10, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 7, 'Serpantin temizligi yapin (gerekirse)', 1, 20, NOW(), '127.0.0.1', false),
('61000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', 8, 'Üniteyi calistirin ve test edin. Sonuc fotografi cekin', 0, 10, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- Bakım Karti Malzemeleri - AHU Aylik
INSERT INTO "MaintenanceCardMaterials" (
    "Id", "TenantId", "CardId", "StockCardId", "Quantity",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('62000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 4, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 1, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 2, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- WORK ORDERS
-- ============================
-- WorkOrderType: Corrective=0, Preventive=1, Predictive=2
-- Priority: Low=0, Medium=1, High=2, Critical=3
-- WorkOrderStatus: Open=0, Assigned=1, InProgress=2, OnHold=3, Completed=4, Cancelled=5

INSERT INTO "WorkOrders" (
    "Id", "TenantId", "OrderNumber", "Type", "Priority", "Status", "Title",
    "ReportedBy", "LocationId", "ScheduledStart", "ActualStart", "ActualEnd", "SlaDeadline",
    "AssetId", "MaintenancePlanId",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Completed WO
('70000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260301-A1B2C3', 1, 1, 4, 'AHU-01 Aylik Periyodik Bakım - Mart', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '2026-03-01 08:00:00', '2026-03-01 08:15:00', '2026-03-01 10:30:00', '2026-03-02 08:00:00', '20000000-0000-0000-0000-000000000003', NULL, '2026-02-25 10:00:00', '127.0.0.1', false),
-- InProgress WO (current demo scenario)
('70000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260320-D4E5F6', 1, 1, 2, 'AHU-03 Food Court Klima Bakımi', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', '2026-03-20 09:00:00', '2026-03-20 09:10:00', NULL, '2026-03-21 09:00:00', '20000000-0000-0000-0000-000000000005', NULL, '2026-03-18 14:00:00', '127.0.0.1', false),
-- Assigned WO (will be linked to maintenance plan below)
('70000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260325-G7H8I9', 1, 1, 1, 'Chiller #1 Uc Aylik Bakım', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '2026-03-28 08:00:00', NULL, NULL, '2026-03-29 08:00:00', '20000000-0000-0000-0000-000000000001', NULL, '2026-03-22 09:00:00', '127.0.0.1', false),
-- Open WOs
('70000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-J1K2L3', 0, 2, 0, 'Zemin Kat Fan Coil Arızası - Soğutma Yapmiyor', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', NULL, NULL, NULL, '2026-03-27 12:00:00', '20000000-0000-0000-0000-000000000006', NULL, '2026-03-26 08:30:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260326-M4N5O6', 0, 3, 0, 'Food Court Havalandirma Gurultu Sikayeti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', NULL, NULL, NULL, '2026-03-26 18:00:00', '20000000-0000-0000-0000-000000000005', NULL, '2026-03-26 10:15:00', '127.0.0.1', false),
-- Overdue WO
('70000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260320-P7Q8R9', 0, 2, 1, '1. Kat Fan Coil Kacak Tespiti', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '2026-03-22 08:00:00', NULL, NULL, '2026-03-24 08:00:00', '20000000-0000-0000-0000-000000000007', NULL, '2026-03-20 16:00:00', '127.0.0.1', false),
-- More completed WOs for chart data
('70000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260215-S1T2U3', 1, 0, 4, 'AHU-02 Aylik Bakım - Şubat', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000024', '2026-02-15 08:00:00', '2026-02-15 08:20:00', '2026-02-15 10:00:00', '2026-02-16 08:00:00', '20000000-0000-0000-0000-000000000004', NULL, '2026-02-10 10:00:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260210-V4W5X6', 0, 1, 4, 'Chiller #2 Soğutucu Gaz Kacagi Onarimi', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', '2026-02-10 14:00:00', '2026-02-10 14:30:00', '2026-02-10 18:00:00', '2026-02-11 14:00:00', '20000000-0000-0000-0000-000000000002', NULL, '2026-02-10 11:00:00', '127.0.0.1', false),
('70000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'WO-20260128-Y7Z8A9', 2, 2, 4, 'Jeneratör titresim kestirimci analizi', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', '2026-01-28 09:00:00', '2026-01-28 09:10:00', '2026-01-28 11:20:00', '2026-01-29 09:00:00', '20000000-0000-0000-0000-000000000010', NULL, '2026-01-26 15:00:00', '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- WORK ORDER ASSIGNEES
-- ============================
INSERT INTO "WorkOrderAssignees" (
    "Id", "TenantId", "WorkOrderId", "UserId", "Role",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Ahmet (teknisyen) tum aktif WO'lara atanmis
('71000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-26 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-19 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-23 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-03-21 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-12 08:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'technician', '2026-02-10 12:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'technician', '2026-03-26 09:00:00', '127.0.0.1', false),
('71000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '70000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'technician', '2026-01-27 14:00:00', '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- STOCK MOVEMENTS (Tuketim hizi / maliyet metrikleri)
-- ============================
-- MovementType: In=0, Out=1, Transfer=2, Adjustment=3, Count=4, Return=5

INSERT INTO "StockMovements" (
    "Id", "TenantId", "StockCardId", "MovementType", "Quantity", "Unit",
    "FromLocationId", "ToLocationId", "ReferenceType", "ReferenceId", "Notes",
    "PerformedBy", "PerformedAt",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('32000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000001', 1, 6, 'adet', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000024', 'WorkOrder', '70000000-0000-0000-0000-000000000001', 'AHU aylik bakım filtre kullanimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '28 day', NOW() - INTERVAL '28 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', 1, 10, 'kg', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000008', 'Chiller gaz takviyesi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '24 day', NOW() - INTERVAL '24 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000006', 1, 5, 'adet', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000023', 'WorkOrder', '70000000-0000-0000-0000-000000000002', 'Food court serpantin temizligi', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '18 day', NOW() - INTERVAL '18 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000029', 1, 12, 'adet', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000011', 'WorkOrder', '70000000-0000-0000-0000-000000000004', 'Fan coil filtre değişimi', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '12 day', NOW() - INTERVAL '12 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000005', 1, 3, 'litre', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000003', 'Chiller yağ tamamlama', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '8 day', NOW() - INTERVAL '8 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000003', 1, 4, 'adet', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000024', 'WorkOrder', '70000000-0000-0000-0000-000000000007', 'Kayış değişimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 day', NOW() - INTERVAL '4 day', '127.0.0.1', false),
('32000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30000000-0000-0000-0000-000000000004', 1, 7, 'kg', '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000020', 'WorkOrder', '70000000-0000-0000-0000-000000000006', 'Acil sogutucu gaz tuketimi', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day', '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- PERIODIC MAINTENANCE (Time-Based Demo)
-- ============================
-- Chiller kartina malzeme ekle (stok bilincli blokaj senaryosu için)
INSERT INTO "MaintenanceCardMaterials" (
    "Id", "TenantId", "CardId", "StockCardId", "Quantity",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('62000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 25, NOW(), '127.0.0.1', false),
('62000000-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 5, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- MaintenancePlanTriggerType: TimeBased=0, MeterBased=1, Hybrid=2
-- Priority: Low=0, Medium=1, High=2, Critical=3

INSERT INTO "MaintenancePlans" (
    "Id", "TenantId", "Name", "MaintenanceCardId", "AssetId", "TriggerType",
    "FrequencyDays", "MeterInterval", "CurrentMeterReading", "NextDueAt", "NextDueMeter",
    "LastRunAt", "Priority", "IsActive",
    "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
-- Time-based: ilk acilista overdue (worker hemen WO uretsin)
('80000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-01 Aylik Plan', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 0, 30, NULL, 0, NOW() - INTERVAL '2 day', NULL, NULL, 1, true, NOW(), '127.0.0.1', false),
-- Time-based: stok yetersiz (R410A 25kg istenir, stok 15kg)
('80000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chiller-1 Zaman Bazli Plan', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 0, 14, NULL, 0, NOW() - INTERVAL '1 day', NULL, NULL, 2, true, NOW(), '127.0.0.1', false),
-- Time-based: açık is emri varken tekrar uretilmesin (skip existing open WO)
('80000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AHU-03 Zaman Bazli Plan', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 0, 30, NULL, 0, NOW() - INTERVAL '1 day', NULL, NULL, 1, true, NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- Hibrit plan için mevcut açık WO'yu bagla
UPDATE "WorkOrders"
SET "MaintenancePlanId" = '80000000-0000-0000-0000-000000000003'
WHERE "Id" = '70000000-0000-0000-0000-000000000003';

-- ============================
-- ASSET HISTORY (Rich demo timeline)
-- ============================
-- AssetHistoryActionType: Created=0, Updated=1, StatusChanged=2, LocationChanged=3, Assigned=4,
--   Unassigned=5, MaintenanceLinked=6, MaintenanceCompleted=7, WarrantyUpdated=8, NoteAdded=9, ParentChanged=10

INSERT INTO "AssetHistories" (
    "Id", "AssetId", "ActionType", "OldValue", "NewValue",
    "PerformedBy", "PerformedAt", "ReferenceType", "ReferenceId", "Note",
    "TenantId", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('81000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 0, NULL, '{"status":0,"locationId":"10000000-0000-0000-0000-000000000020"}', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '180 day', 'asset', '20000000-0000-0000-0000-000000000001', 'Asset created and commissioned', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 2, '{"status":0}', '{"status":2}', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 day', 'work_order', '70000000-0000-0000-0000-000000000003', 'Status changed to maintenance for preventive service', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 4, '{"assignedToUserId":null}', '{"assignedToUserId":"b0000000-0000-0000-0000-000000000002"}', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '7 day', 'assignment', '20000000-0000-0000-0000-000000000003', 'Assigned to technician Ahmet for route inspections', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 2, '{"status":0}', '{"status":1}', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 day', 'work_order', '70000000-0000-0000-0000-000000000002', 'Noise fault detected at Food Court AHU', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 8, '{"warrantyEndDate":"2026-03-01"}', '{"warrantyEndDate":"2026-03-15"}', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 day', 'contract', '50000000-0000-0000-0000-000000000001', 'Warranty extension applied by supplier', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 3, '{"locationId":"10000000-0000-0000-0000-000000000022"}', '{"locationId":"10000000-0000-0000-0000-000000000011"}', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 day', 'transfer', '20000000-0000-0000-0000-000000000006', 'Transferred from depot to ground floor for installation', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 10, '{"parentAssetId":null}', '{"parentAssetId":"20000000-0000-0000-0000-000000000004"}', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '10 day', 'structure', '20000000-0000-0000-0000-000000000004', 'Linked as child terminal unit under AHU-02', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000009', 6, NULL, '{"maintenancePlanId":"80000000-0000-0000-0000-000000000001"}', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '14 day', 'maintenance_plan', '80000000-0000-0000-0000-000000000001', 'Fire panel linked to monthly checklist', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('81000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000010', 7, NULL, '{"workOrderId":"70000000-0000-0000-0000-000000000009"}', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '6 day', 'work_order', '70000000-0000-0000-0000-000000000009', 'Generator predictive maintenance completed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

-- ============================
-- ASSET MOVEMENTS
-- ============================
-- AssetMovementType: LocationTransfer=0, Assignment=1, Return=2, StatusChange=3, Checkout=4, Checkin=5

INSERT INTO "AssetMovements" (
    "Id", "AssetId", "MovementType",
    "FromLocationId", "ToLocationId", "FromUserId", "ToUserId",
    "Reason", "MovedBy", "MovedAt", "Notes",
    "TenantId", "CreatedAt", "ChangeIp", "IsDeleted"
)
VALUES
('82000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 1, '10000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000024', NULL, 'b0000000-0000-0000-0000-000000000002', 'route_assignment', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '7 day', 'Assigned for daily AHU route inspection', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('82000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', 0, '10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000011', NULL, NULL, 'installation_transfer', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 day', 'Moved from depot to ground floor installation zone', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('82000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 2, '10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', NULL, 'temporary_return', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day', 'Returned after shift completion', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('82000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 3, '10000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000020', NULL, NULL, 'preventive_maintenance_window', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '20 day', 'Status switched to IN_MAINTENANCE', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('82000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 4, '10000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'fault_checkout', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 day', 'Checked out for fault diagnosis in food court', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false),
('82000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 5, '10000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'fault_checkin', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 day', 'Checked in after diagnostics', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), '127.0.0.1', false)
ON CONFLICT DO NOTHING;

RESET search_path;

-- ============================
-- VERIFICATION REPORT (Railway-friendly)
-- ============================
SELECT 'Tenants' AS "Table", COUNT(*) AS "Count" FROM public."Tenants" WHERE "Slug" IN ('abc-avm', 'test-tenant')
UNION ALL
SELECT 'Locations', COUNT(*) FROM public."Locations" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Assets', COUNT(*) FROM public."Assets" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'StockCards', COUNT(*) FROM public."StockCards" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'StockBalances', COUNT(*) FROM public."StockBalances" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Vendors', COUNT(*) FROM public."Vendors" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'ServiceAgreements', COUNT(*) FROM public."ServiceAgreements" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'MaintenanceCards', COUNT(*) FROM public."MaintenanceCards" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'MaintenanceCardSteps', COUNT(*) FROM public."MaintenanceCardSteps" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'MaintenanceCardMaterials', COUNT(*) FROM public."MaintenanceCardMaterials" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'WorkOrders', COUNT(*) FROM public."WorkOrders" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'WorkOrderAssignees', COUNT(*) FROM public."WorkOrderAssignees" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'StockMovements', COUNT(*) FROM public."StockMovements" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'MaintenancePlans', COUNT(*) FROM public."MaintenancePlans" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'AssetHistories', COUNT(*) FROM public."AssetHistories" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'AssetMovements', COUNT(*) FROM public."AssetMovements" WHERE "TenantId" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
ORDER BY "Table";

-- Railway run marker (if you don't see this row, script execution likely stopped early)
SELECT 'SEED_END' AS "Marker", NOW() AS "RunAt";



