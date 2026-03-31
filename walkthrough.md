# FMMS Demo Walkthrough

> **Hedef:** Muşteriye "sahada teknisyen olarak işe başladım, bakım yaptım, fotoğraf çektim, malzeme kullandım, servis anlaşması kapsamında çalıştım" akışını uçtan uca göstermek.

---

## Demo Senaryosu: "AVM Klima Bakımı"

**Tenant:** ABC AVM (abc-avm)
**Roller:** Yönetici (web), Teknisyen Ahmet (mobil), Stok Sorumlusu Zeynep (web)

---

## Bolum 1 -- On Hazirlik (Web Panel - Yonetici)

### 1.1 Lokasyon Agaci Olusturma
Web panelden lokasyon hiyerarsisi kurulur:
```
ABC AVM (facility)
  └── A Blok (building)
       ├── Kat 1 (floor)
       │    ├── Mağaza Alanı (section)
       │    └── Yemek Katı (section)
       └── Kat 2 (floor)
            └── Teknik Oda (room)
```
- `POST /api/v1/t/abc-avm/locations` ile hiyerarşik oluşturma (parentId ile)
- Lokasyonlara NFC tag atama: `POST /api/v1/t/abc-avm/locations/{id}/assign-nfc`
- Lokasyonlara barkod atama: `POST /api/v1/t/abc-avm/locations/{id}/assign-barcode`

### 1.2 Varlik (Asset) Tanimlama
Bakımı yapılacak varlıklar (klimalar, jeneratörler vb.) sisteme eklenir:
```json
{
  "name": "Kat 1 Salon Kliması",
  "category": "HVAC",
  "locationId": "<Kat 1 UUID>",
  "manufacturer": "Daikin",
  "model": "FTX-35",
  "serialNumber": "DK-2024-001",
  "status": "active"
}
```
- `POST /api/v1/t/abc-avm/assets` ile varlık oluşturma
- Her varlığa barkod ve NFC tag atanabilir

### 1.3 Stok Kartlari Olusturma
Bakımda kullanılacak malzemeler stok kartı olarak tanımlanır:
```json
{
  "name": "Klima Filtresi (Daikin FTX Serisi)",
  "stockNumber": "STK-FLT-001",
  "category": "filtre",
  "unit": "adet",
  "minStockLevel": 10,
  "unitPrice": 450.00,
  "currency": "TRY",
  "spec2000Code": "13-21-01"
}
```
- `POST /api/v1/t/abc-avm/inventory/stock-cards` ile stok kartı oluşturma
- **Diger ornek stok kartlari:**
  - Kompresör Yağı (litre bazlı, min stok: 5L)
  - Bakır Boru 1/4" (metre bazlı, min stok: 20m)
  - R410A Soğutucu Gaz (kg bazlı, min stok: 3kg)

### 1.4 Stok Giris Hareketi
Stok kartlarına başlangıç stok girişi yapılır:
```json
{
  "type": "in",
  "stockCardId": "<Klima Filtresi UUID>",
  "quantity": 50,
  "toLocationId": "<Teknik Oda UUID>",
  "note": "İlk stok girişi - tedarikçi teslimatı"
}
```
- `POST /api/v1/t/abc-avm/inventory/movements` ile giriş/çıkış/transfer
- Idempotency-Key header'ı ile mükerrer işlem koruması

### 1.5 Bakim Karti Olusturma
Tekrarlanacak bakım prosedürü şablon olarak tanımlanır:
```json
{
  "name": "Klima Periyodik Bakım Kartı",
  "assetCategory": "HVAC",
  "level": "L2_technician",
  "defaultPeriodDays": 90,
  "isTemplate": true
}
```
- `POST /api/v1/t/abc-avm/maintenance/cards` ile bakım kartı oluşturma

#### Bakim Adimlari (Steps)
Bakım kartına adımlar eklenir:
| Sira | Talimat | Durum | Tahmini Sure |
|------|---------|-------|-------------|
| 1 | Klimayı kapat ve elektriğini kes | mandatory | 5 dk |
| 2 | Filtreleri çıkar ve kontrol et | mandatory | 10 dk |
| 3 | Yeni filtre tak (gerekiyorsa) | optional | 10 dk |
| 4 | Soğutucu gaz basıncını ölç | mandatory | 15 dk |
| 5 | Drenaj hattını temizle | mandatory | 10 dk |
| 6 | Elektrik bağlantılarını kontrol et | mandatory | 10 dk |
| 7 | Test çalıştırması yap ve sıcaklık ölç | mandatory | 15 dk |

#### Bakim Malzemeleri
Bakım kartına gerekli malzemeler bağlanır:
| Malzeme (Stok Kartı) | Miktar |
|----------------------|--------|
| Klima Filtresi | 1 adet |
| Kompresör Yağı | 0.5 litre |
| R410A Soğutucu Gaz | 0.3 kg |

### 1.6 Servis Anlasmasi Olusturma
Dış servis sağlayıcı ile yapılan anlaşma sisteme girilir:
```json
{
  "vendorId": "<Klima Servis A.Ş. UUID>",
  "agreementNumber": "SVC-2026-001",
  "title": "Klima Bakım ve Onarım Servis Anlaşması",
  "scopeDescription": "Tüm HVAC sistemleri periyodik bakım + arıza müdahale",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "autoRenew": true,
  "slaResponseHours": 4,
  "slaResolutionHours": 24,
  "cost": 120000.00,
  "currency": "TRY",
  "status": "active",
  "coveredAssetIds": ["<Klima-1 UUID>", "<Klima-2 UUID>"],
  "coveredMaintTypes": ["preventive", "corrective"]
}
```
- Garanti ve servis anlaşmaları ile varlıklar ilişkilendirilir
- SLA süreleri tanımlanarak performans takibi sağlanır

### 1.7 Bakim Zamanlama (Schedule)
Bakım kartı + varlık + periyot ile otomatik iş emri üretimi planlanır:
```
POST /api/v1/t/abc-avm/maintenance/schedules
{
  "maintCardId": "<Klima Bakım Kartı UUID>",
  "assetId": "<Kat 1 Kliması UUID>",
  "cronExpression": "0 22 1 */3 *",
  "timeConstrStart": "22:00",
  "timeConstrEnd": "06:00"
}
```
- AVM klimaları için bakım saati 22:00 sonrası (müşteri deneyimi kuralı)
- Cron ile her 3 ayda bir otomatik iş emri üretilir

---

## Bolum 2 -- Ariza Bildirimi & Is Emri Olusturma (Web Panel)

### 2.1 Ariza Bildirimi ile Is Emri Acma
AVM güvenlik görevlisi, Kat 1 klimasının soğutmadığını bildiriyor:
```json
{
  "title": "Kat 1 Salon Kliması soğutmuyor",
  "type": "corrective",
  "priority": "high",
  "assetId": "<Kat 1 Kliması UUID>",
  "locationId": "<Kat 1 UUID>",
  "description": "Klima çalışıyor ama soğuk hava vermiyor, müşteri şikayeti var",
  "reportedByUserId": "<Güvenlik Görevlisi UUID>",
  "slaMinutes": 240
}
```
- `POST /api/v1/t/abc-avm/work-orders` ile iş emri oluşturulur
- Durum: **open**
- SLA süresi: 4 saat (servis anlaşmasına uygun)

### 2.2 Teknisyen Atama
Bakım şefi, uygun teknisyeni atar:
- `GET /api/v1/t/abc-avm/work-orders/{id}/suggested-technicians` -- skill-based öneri
- `POST /api/v1/t/abc-avm/work-orders/{id}/assign` ile Teknisyen Ahmet atanır
- Durum: **open** -> **assigned**
- Ahmet'e push bildirim gider

---

## Bolum 3 -- Saha Calismasi (Mobil Uygulama - Teknisyen Ahmet)

> Bu bolum demo'nun en kritik kismıdır. Musterinin "sahada ne oluyor?" sorusuna cevap verir.

### 3.1 Bildirim & Is Emri Goruntuleme
- Ahmet telefonunda push bildirim alır
- Uygulamayı açar, atanan iş emrini görür
- İş emri detayında:
  - Varlık bilgisi (Kat 1 Salon Kliması - Daikin FTX-35)
  - Lokasyon (ABC AVM > A Blok > Kat 1)
  - Öncelik: Yüksek
  - SLA: 4 saat
  - Bakım kartı adımları listesi
  - Gerekli malzeme listesi

### 3.2 Ise Basla -- NFC Check-in
Ahmet, lokasyona vardığında:
1. Telefonunu NFC tag'a yaklaştırır
2. NFC check-in kaydı oluşur: `POST /api/v1/t/abc-avm/nfc/check-in`
   ```json
   {
     "nfcTagId": "NFC-KAT1-001",
     "checkType": "maintenance"
   }
   ```
3. İş emri durumu: **assigned** -> **in_progress**
4. `actual_start` timestamp kaydedilir

### 3.3 Baslangic Fotograflari
Ahmet, işe başlamadan önce mevcut durumu fotoğraflar:
- Kamera açılır (expo-camera)
- GPS koordinatları otomatik eklenir (EXIF metadata)
- **Fotoğraf yükleme akışı:**
  1. `POST /api/v1/t/abc-avm/files/presigned-url` ile presigned URL alınır
  2. Mobil uygulama, fotoğrafı doğrudan MinIO/S3'e yükler
  3. `POST /api/v1/t/abc-avm/work-orders/{id}/photos` ile iş emrine bağlanır
     ```json
     {
       "photoType": "before",
       "fileObjectId": "<Yuklenen dosya UUID>",
       "gpsLat": 41.0082,
       "gpsLng": 28.9784,
       "capturedBy": "<Ahmet UUID>"
     }
     ```
- **Birden fazla fotoğraf** yüklenebilir (ön panel, filtre durumu, gaz basıncı göstergesi)

### 3.4 Bakim Adimlarini Isletme
Ahmet, bakım kartındaki adımları sırayla tamamlar:

| Adim | Talimat | Ahmet'in Islemi | Durum |
|------|---------|-----------------|-------|
| 1 | Klimayı kapat ve elektriğini kes | Tamamladı | completed |
| 2 | Filtreleri çıkar ve kontrol et | Filtre kirli, değişim gerekli | completed |
| 3 | Yeni filtre tak | **Stoktan filtre kullandı** | completed |
| 4 | Soğutucu gaz basıncını ölç | Basınç düşük, gaz takviyesi gerekli | completed |
| 5 | Drenaj hattını temizle | Tıkanıklık vardı, temizlendi | completed |
| 6 | Elektrik bağlantılarını kontrol et | Normal | completed |
| 7 | Test çalıştırması yap | Soğutma OK, 18°C'ye düştü | completed |

### 3.5 Malzeme Kullanimi (Stok Cikisi)
Ahmet, bakım sırasında malzeme kullanır. Bu stok çıkış hareketi olarak kaydedilir:

**Filtre kullanımı:**
```json
{
  "type": "out",
  "stockCardId": "<Klima Filtresi UUID>",
  "quantity": 1,
  "fromLocationId": "<Teknik Oda UUID>",
  "referenceType": "work_order",
  "referenceId": "<İş Emri UUID>",
  "note": "Kat 1 klima bakımı - filtre değişimi"
}
```

**Soğutucu gaz kullanımı:**
```json
{
  "type": "out",
  "stockCardId": "<R410A Gaz UUID>",
  "quantity": 0.5,
  "fromLocationId": "<Teknik Oda UUID>",
  "referenceType": "work_order",
  "referenceId": "<İş Emri UUID>",
  "note": "Kat 1 klima - gaz takviyesi"
}
```

- `POST /api/v1/t/abc-avm/inventory/movements` ile stok hareketi oluşur
- Stok bakiyesi otomatik güncellenir (`stock_balances`)
- Min stok altına düşerse otomatik bildirim üretilir

### 3.6 Calisma Sirasinda Fotograflar
Ahmet, çalışma sırasında da fotoğraf çeker:
- Kirli filtre fotoğrafı
- Yeni filtre montajı
- Gaz basınç göstergesi
```json
{
  "photoType": "during",
  "fileObjectId": "<UUID>",
  "gpsLat": 41.0082,
  "gpsLng": 28.9784
}
```

### 3.7 Sesli Not (Opsiyonel)
Ahmet, yazı yazmak yerine sesli not bırakabilir:
- `POST /api/v1/t/abc-avm/work-orders/{id}/speech-note`
- Whisper API ile otomatik transkripsiyon
- "Filtre çok kirliydi, muhtemelen 6 aydır değişmemiş. Gaz basıncı 2 bar düşüktü, takviye yaptım. Drenaj hattında tıkanıklık vardı."

### 3.8 Is Tamamlama -- Bitis Fotograflari
Ahmet işi bitirdiğinde:
1. **Bitiş fotoğrafları** çeker:
   ```json
   {
     "photoType": "after",
     "fileObjectId": "<UUID>",
     "gpsLat": 41.0082,
     "gpsLng": 28.9784
   }
   ```
2. İş emri durumunu günceller:
   - `PATCH /api/v1/t/abc-avm/work-orders/{id}/status` -> **completed**
   - `actual_end` timestamp kaydedilir
3. SLA uyumu otomatik kontrol edilir (4 saatlik SLA'ya uyuldu mu?)

---

## Bolum 4 -- Stok Takibi & Min Stok Uyarisi (Web Panel)

### 4.1 Stok Durumu Kontrolu
Stok sorumlusu Zeynep, güncel stok durumunu kontrol eder:
- `GET /api/v1/t/abc-avm/inventory/stock-cards` ile tüm stok kartlarını listeler
- Her stok kartının mevcut bakiyesi (`stock_balances`) görünür

### 4.2 Min Stok Alti Uyarisi
Filtre stoğu kritik seviyeye düştüyse:
- `GET /api/v1/t/abc-avm/inventory/low-stock` ile min stok altındaki kartlar listelenir
- Sistem otomatik bildirim üretir (push + email)
- Zeynep satın alma talebi oluşturabilir:
  `POST /api/v1/t/abc-avm/procurement/purchase-requests`

### 4.3 Stok Hareket Gecmisi
Herhangi bir stok kartının hareket geçmişi izlenebilir:
- `GET /api/v1/t/abc-avm/inventory/movements?stockCardId=<UUID>`
- Giriş, çıkış, transfer, düzeltme hareketleri tarihçesi

---

## Bolum 5 -- Servis Anlasmasi & SLA Takibi (Web Panel)

### 5.1 Servis Anlasmasi Goruntuleme
Yönetici, servis anlaşmalarını inceler:
- Hangi varlıklar kapsanıyor?
- SLA süreleri nedir? (müdahale: 4 saat, çözüm: 24 saat)
- Anlaşma bitiş tarihi yaklaşıyor mu? (otomatik yenileme aktif mi?)
- Maliyet bilgisi

### 5.2 Garanti Takibi
Varlıkların garanti durumu izlenir:
- Garanti bitiş tarihine X gün kala uyarı (`alert_days_before`)
- Garanti türleri: manufacturer, extended, service, service_agreement
- Garanti belgesi dosya olarak eklenir (`document_file_object_id`)

### 5.3 Vendor Performans
Servis sağlayıcı performansı değerlendirilir:
- SLA uyum oranı
- Tamamlanan iş emri sayısı
- Ortalama çözüm süresi
- Vendor rating (`rating` alanı)

---

## Bolum 6 -- Geri Bildirim & Kapanıs

### 6.1 Memnuniyet Anketi
İş emri tamamlandıktan sonra, bildirimi yapan kişiye anket gönderilir:
- `POST /api/v1/t/abc-avm/work-orders/{id}/feedback`
  ```json
  {
    "rating": 5,
    "comment": "Hızlı müdahale edildi, klima düzgün çalışıyor"
  }
  ```

### 6.2 Raporlama
Yönetici dashboard'unda:
- `GET /api/v1/t/abc-avm/reports/kpi` -- KPI özet
- `GET /api/v1/t/abc-avm/reports/fault-frequency` -- arıza sıklık analizi
- `GET /api/v1/t/abc-avm/reports/indoor-heatmap-data` -- şikayet yoğunluk haritası

---

## Demo Ozet Tablosu

| Adim | Ne Gosteriliyor | Platform | Kritik API |
|------|----------------|----------|-----------|
| Lokasyon oluştur | Hiyerarşik tesis yapısı | Web | POST locations |
| Varlık tanımla | Klima kaydı | Web | POST assets |
| Stok kartı oluştur | Filtre, gaz, yağ | Web | POST stock-cards |
| Stok girişi yap | İlk envanter | Web | POST movements |
| Bakım kartı oluştur | Prosedür + adımlar + malzeme | Web | POST maintenance/cards |
| Servis anlaşması | SLA + kapsam | Web | POST svc_agreements |
| İş emri aç | Arıza bildirimi | Web | POST work-orders |
| Teknisyen ata | Skill-based öneri | Web | POST assign |
| NFC check-in | Lokasyona varış | Mobil | POST nfc/check-in |
| Başlangıç fotoğrafı | Mevcut durum kaydı | Mobil | POST photos (before) |
| Bakım adımları | Step-by-step prosedür | Mobil | PATCH steps |
| Malzeme kullanımı | Stok çıkışı | Mobil | POST movements (out) |
| Ara fotoğraflar | Çalışma kanıtı | Mobil | POST photos (during) |
| Sesli not | Hızlı not alma | Mobil | POST speech-note |
| Bitiş fotoğrafı | Tamamlanma kanıtı | Mobil | POST photos (after) |
| İş tamamla | Durum güncelleme | Mobil | PATCH status |
| Min stok uyarısı | Otomatik bildirim | Web | GET low-stock |
| SLA kontrolü | Performans takibi | Web | reports/kpi |
| Geri bildirim | Memnuniyet anketi | Web | POST feedback |

---

## Teknik Notlar

- **API Base URL:** `/api/v1/t/{tenant-slug}/...`
- **Auth:** Bearer JWT (Keycloak)
- **Dosya yükleme:** Presigned URL ile doğrudan MinIO/S3'e upload
- **Offline:** Mobil uygulama NFC, iş emri ve stok hareketi modüllerinde çevrimdışı çalışır
- **Idempotency:** Stok hareketleri ve iş emri oluşturmada Idempotency-Key önerilir
- **Multi-tenant:** Schema-per-tenant izolasyonu (PostgreSQL)
- **Fotoğraf metadata:** GPS koordinatları + EXIF bilgisi otomatik kaydedilir
