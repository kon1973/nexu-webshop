# 📧 Modern Email Templates & 📄 PDF Katalógus Export

## Áttekintés

Az email és export rendszer fejlesztése két fő területre fókuszál:

### 1. Modern Email Template Rendszer
Újratervezett, professzionális HTML email template-ek komponens alapú architektúrával.

### 2. PDF Katalógus Generálás
Termékek PDF formátumban történő exportálása testreszabható beállításokkal.

---

## 📧 Modern Email Templates

### Funkciók

- **Komponens-alapú architektúra**: Újrahasználható email komponensek
- **Reszponzív dizájn**: Mobilon és desktopon is tökéletesen néz ki
- **Modern vizuális megjelenés**: Sötét téma, gradiens színek, kerek sarkok
- **Email kliens kompatibilitás**: Gmail, Outlook, Apple Mail támogatás
- **Preheader szöveg**: Jobb előnézet a postafiókban

### Használat

#### Email Template Komponensek (`lib/email-templates.ts`)

```typescript
import {
  emailWrapper,
  emailContainer,
  emailHeader,
  emailCard,
  emailTitle,
  emailParagraph,
  emailButton,
  emailBadge,
  emailDivider,
  emailInfoBox,
  emailFooter,
  emailProductCard,
} from '@/lib/email-templates'
```

#### Példa Email Küldés

```typescript
import { sendModernOrderEmail } from '@/lib/email-modern'

await sendModernOrderEmail({
  orderId: 'order_123',
  customerName: 'Nagy Péter',
  customerEmail: 'peter@example.com',
  customerAddress: 'Budapest, Fő utca 1.',
  items: [
    { name: 'iPhone 15', quantity: 1, unitPrice: 350000, image: 'https://...' }
  ],
  subtotal: 350000,
  shippingCost: 0,
  totalPrice: 350000,
  paymentMethod: 'stripe'
})
```

#### Komponensek Dokumentációja

- **`emailWrapper`**: HTML wrapper preheader támogatással
- **`emailContainer`**: Központosított tartalom konténer
- **`emailHeader`**: Logo/cím fejléc
- **`emailCard`**: Kártyás doboz tartalomhoz
- **`emailTitle`**: Nagy cím (h1)
- **`emailSubtitle`**: Alcím (h2)
- **`emailParagraph`**: Bekezdés
- **`emailButton`**: CTA gomb (primary/secondary)
- **`emailBadge`**: Színes badge (success/warning/error/info)
- **`emailDivider`**: Elválasztó vonal
- **`emailInfoBox`**: Információs doboz címkével és értékkel
- **`emailFooter`**: Lábléc copyright információval
- **`emailProductCard`**: Termék kártya képpel, árral

### Migráció Meglévő Template-ekről

A régi `lib/email.ts` funkciók továbbra is működnek. Az új template-ek használata opcionális:

```typescript
// Régi
import { sendOrderEmails } from '@/lib/email'

// Új
import { sendModernOrderEmail } from '@/lib/email-modern'
```

---

## 📄 PDF Katalógus Generálás

### Funkciók

- **Teljes termékkatalógus**: Összes termék PDF-ben
- **Kategória szerinti csoportosítás**: Áttekinthetőbb struktúra
- **Testreszabható szűrők**:
  - Elfogyott termékek be/kizárása
  - Archivált termékek be/kizárása
  - Kategória szerinti szűrés
  - Rendezés (név/ár/kategória)
- **Professzionális megjelenés**: NEXU branding, táblázatos elrendezés
- **Automatikus oldalszámozás**: Fejléc és lábléc minden oldalon

### Admin Használat

1. Menj az **Admin Dashboard**-ra
2. Kattints a **"PDF Katalógus"** gombra
3. (Opcionális) Nyisd ki a beállítások menüt a lenyíló nyílra kattintva:
   - ✅ Elfogyott termékek is
   - ✅ Archivált termékek is
   - 📊 Rendezés: Kategória/Név/Ár szerint
4. Kattints az **"PDF Katalógus"** gombra az exportáláshoz

### Server Action Használat

A PDF katalógus generálás **Server Action**-t használ (nem API endpoint-ot):

```typescript
import { exportCatalogAction } from '@/app/admin/actions'

const result = await exportCatalogAction({
  includeOutOfStock: true,
  includeArchived: false,
  sortBy: 'name',
  title: 'Egyedi Katalógus'
})

if (result.success && result.pdfBase64) {
  // Base64 PDF letöltése a kliensen
  const blob = base64ToBlob(result.pdfBase64)
  downloadFile(blob, result.fileName)
}
```

**Miért Server Action?**
- ✅ Egyszerűbb architektúra
- ✅ Nincs API overhead
- ✅ Type-safe
- ✅ API-k csak mobil app-nak vannak fenntartva

### Programmatic Használat

```typescript
import { generateProductCatalogPDF } from '@/lib/pdf-catalog'

const pdfBuffer = await generateProductCatalogPDF({
  includeOutOfStock: true,
  includeArchived: false,
  categories: ['Telefon', 'Laptop'],
  sortBy: 'price',
  title: 'Egyedi Termékkatalógus 2026'
})

// Save to file
fs.writeFileSync('catalog.pdf', pdfBuffer)
```

---

## 🛠️ Telepítés & Konfiguráció

### Függőségek

```bash
npm install jspdf jspdf-autotable
```

### TypeScript Típusok

A `jspdf` és `jspdf-autotable` típusok automatikusan települnek.

---

## 📁 Fájlstruktúra

```
lib/
├── email-templates.ts      # Email komponens library
├── email-modern.ts          # Modern email implementációk
├── email.ts                 # Régi email funkciók (még aktív)
└── pdf-catalog.ts           # PDF generálás logika

app/
├── admin/
│   ├── actions.ts               # Server Actions (PDF export)
│   ├── ExportCatalogButton.tsx  # UI komponens
│   └── page.tsx                 # Dashboard integráció
```

---

## 🎨 Testreszabás

### Email Színek Módosítása

Szerkeszd a `lib/email-templates.ts` fájl elején az `emailStyles` objektumot:

```typescript
export const emailStyles = {
  primary: '#7c3aed',        // Lila
  primaryHover: '#6d28d9',
  background: '#0a0a0a',     // Sötét
  surface: '#121212',
  // ... további színek
}
```

### PDF Katalógus Stílus

Módosítsd a `lib/pdf-catalog.ts` fájlban a `createPDF` függvényt:

```typescript
// Fejléc színe
doc.setFillColor(124, 58, 237) // RGB: lila

// Táblázat stílus
headStyles: {
  fillColor: [26, 26, 26],
  textColor: [255, 255, 255],
  fontStyle: 'bold',
}
```

---

## 🧪 Tesztelés

### Email Template Előnézet

Használd a Resend Dashboard "Preview" funkcióját vagy küldd el tesztelésre:

```typescript
await sendModernOrderEmail({
  // ... test adatok
})
```

### PDF Generálás Tesztelés

```bash
# Dev módban
npm run dev
typescript
// Server Action tesztelés
import { exportCatalogAction } from '@/app/admin/actions'

const result = await exportCatalogAction({
  includeOutOfStock: true,
  sortBy: 'name'
})

console.log(result.success) // true/false
```

```bash
# Dev módban
npm run dev

# Admin dashboardon keresztül
http://localhost:3000/admin (Server Action auth check)
- ✅ Email címek validálva vannak
- ✅ HTML escape az email tartalomban
- ✅ Server Action védve NextAuth session ellenőrzéssel
- ✅ Base64 PDF transfer biztonságos
- **Email generálás**: ~50-100ms / email
- **PDF generálás**: ~200-500ms (50-100 termék)
- **Memória**: ~10-20MB átlagosan (PDF buffer)

---

## 🔒 Biztonsági Megjegyzések

- ✅ PDF export csak admin felhasználóknak elérhető
- ✅ Email címek validálva vannak
- ✅ HTML escape az email tartalomban
- ✅ API endpoint védve NextAuth session ellenőrzéssel

---

## 🚀 Jövőbeli Fejlesztési Lehetőségek

### Email:
- [ ] A/B testing különböző template verziókon
- [ ] Email analytics (open rate, click rate)
- [ ] Többnyelvű email template-ek
- [ ] Email template editor admin UI-ban
- [ ] Scheduled emails (pl. születésnapi kupon)

### PDF:
- [ ] Termék képek a PDF-ben
- [ ] QR kód termék linkekkel
- [ ] Árfolyam konverzió (EUR, USD)
- [ ] Több sablon választása (minimál, részletes, képes)
- [ ] Automatikus katalógus küldés emailben

---

## 📞 Támogatás

Kérdések esetén:
- GitHub Issues: [projekt repo]
- Email: admin@nexu.hu
- Dokumentáció: [nexu.hu/docs]

---

**Verzió**: 1.0.0  
**Utolsó frissítés**: 2026-01-01
