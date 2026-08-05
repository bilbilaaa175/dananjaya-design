/**
 * =============================================================================
 * ZAHASKY — MOCK DATA LAYER & MOCK API FETCHER (Vanilla JS, Browser-side)
 * =============================================================================
 * File ini adalah lapisan "simulasi backend" yang dipakai langsung oleh
 * catalog.html, package.html, dan publicity.html selama backend Express +
 * Odoo 19 XML-RPC belum terhubung penuh ke frontend.
 *
 * KENAPA FILE INI PENTING:
 * - Struktur field pada setiap item SENGAJA dibuat mirip dengan yang nanti
 *   akan dikembalikan oleh endpoint Express (GET /api/products, dst) yang
 *   di baliknya memanggil Odoo 19 lewat XML-RPC (lihat backend/odooService.js
 *   & data/collections.js di root project).
 * - Saat backend asli sudah siap, tim tinggal mengganti ISI fungsi
 *   `mockFetchList()` dan `mockFetchDetail()` di bagian bawah file ini
 *   dengan `fetch('/api/...')` sungguhan ke Express — TANPA perlu mengubah
 *   kode di catalog.html / package.html / publicity.html, karena kedua
 *   halaman tersebut hanya bergantung pada "kontrak" (shape) data yang
 *   dikembalikan oleh fungsi-fungsi ini, bukan pada detail implementasinya.
 *
 * REKOMENDASI MAPPING FIELD DI ODOO product.template (custom fields):
 *   - x_slug                 (Char)      -> slug URL, harus unique
 *   - x_collection_type      (Selection) -> 'catalog' | 'package' | 'publicity'
 *   - x_category_label       (Char)      -> badge kategori pada card
 *   - x_short_description    (Text)      -> ringkasan singkat untuk card grid
 *   - x_description_html     (Html)      -> deskripsi lengkap (detail view)
 *   - x_gallery_urls         (Text/JSON) -> array URL galeri foto produk
 *   - x_specifications_json  (Text/JSON) -> array {label, value} spesifikasi
 *   - x_tags                 (Many2many) -> tag/label produk
 *   - x_publisher             (Char)     -> khusus publicity: nama media/penerbit
 *   - x_publish_date          (Date)     -> khusus publicity: tanggal terbit
 *   - list_price              (Monetary) -> harga (field bawaan Odoo, null utk publicity)
 * =============================================================================
 */

// -----------------------------------------------------------------------
// HELPER: Generator URL gambar placeholder yang deterministik.
// Dipakai supaya tiap kali halaman di-refresh, gambar yang muncul untuk
// item yang sama selalu konsisten (seed = slug/id). Saat integrasi Odoo
// asli, fungsi ini tidak dipakai lagi — ganti langsung dengan URL
// attachment/ir.attachment dari Odoo.
// -----------------------------------------------------------------------
function zhImg(seed, w, h) {
  w = w || 900;
  h = h || 700;
  return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h;
}

// -----------------------------------------------------------------------
// HELPER: Format angka menjadi format Rupiah (Rp 1.000.000).
// Dipakai di semua halaman (catalog/package) untuk menampilkan harga.
// Mengembalikan string "Hubungi Kami" jika harga null (dipakai publicity).
// -----------------------------------------------------------------------
function zhFormatPrice(value) {
  if (value === null || value === undefined) return "Hubungi Kami";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/* =============================================================================
 * 1. CATALOG — file desain interior siap pakai (produk digital, ada harga)
 * ============================================================================= */
const ZH_CATALOG = [
  {
    id: 101,
    slug: "modern-minimalist-living-room",
    title: "Modern Minimalist Living Room",
    category: "Living Room",
    price: 350000,
    thumbnail: zhImg("catalog-101"),
    shortDescription: "Set gambar kerja & model 3D ruang tamu bergaya minimalis modern dengan palet netral.",
    description: [
      "Paket desain ruang tamu modern minimalis ini dirancang untuk hunian tipe 36–70 dengan pendekatan clean lines dan pencahayaan alami maksimal.",
      "Termasuk denah layout furnitur, gambar potongan, dan render 3D dari tiga sudut pandang berbeda sehingga memudahkan komunikasi dengan tukang atau kontraktor.",
    ],
    gallery: [zhImg("catalog-101-1"), zhImg("catalog-101-2"), zhImg("catalog-101-3"), zhImg("catalog-101-4")],
    specifications: [
      { label: "Format File", value: "PDF, DWG, SKP" },
      { label: "Luas Area", value: "3.6 x 5.2 m" },
      { label: "Jumlah Halaman", value: "18 halaman" },
      { label: "Revisi", value: "1x revisi minor" },
      { label: "Estimasi Pengerjaan", value: "Instant download" },
    ],
    tags: ["Minimalist", "Living Room", "Best Seller"],
  },
  {
    id: 102,
    slug: "scandinavian-bedroom-suite",
    title: "Scandinavian Bedroom Suite",
    category: "Bedroom",
    price: 300000,
    thumbnail: zhImg("catalog-102"),
    shortDescription: "Konsep kamar tidur bernuansa Skandinavia, hangat dan fungsional untuk ruang terbatas.",
    description: [
      "Desain kamar tidur bergaya Scandinavian dengan dominasi warna kayu muda, tekstil rajut, dan pencahayaan lembut.",
      "Cocok untuk kamar utama maupun kamar anak dengan bukaan jendela sedang.",
    ],
    gallery: [zhImg("catalog-102-1"), zhImg("catalog-102-2"), zhImg("catalog-102-3")],
    specifications: [
      { label: "Format File", value: "PDF, SKP" },
      { label: "Luas Area", value: "3.0 x 4.0 m" },
      { label: "Jumlah Halaman", value: "12 halaman" },
      { label: "Revisi", value: "1x revisi minor" },
    ],
    tags: ["Scandinavian", "Bedroom"],
  },
  {
    id: 103,
    slug: "japandi-kitchen-set",
    title: "Japandi Kitchen Set",
    category: "Kitchen",
    price: 420000,
    thumbnail: zhImg("catalog-103"),
    shortDescription: "Perpaduan Jepang & Skandinavia untuk dapur yang tenang, rapi, dan fungsional.",
    description: [
      "Desain dapur bergaya Japandi menonjolkan garis bersih, material kayu gelap, dan penyimpanan tersembunyi.",
      "Cocok untuk dapur tipe island maupun linear dengan bukaan sedang hingga luas.",
    ],
    gallery: [zhImg("catalog-103-1"), zhImg("catalog-103-2"), zhImg("catalog-103-3")],
    specifications: [
      { label: "Format File", value: "PDF, DWG" },
      { label: "Luas Area", value: "4.0 x 3.2 m" },
      { label: "Jumlah Halaman", value: "15 halaman" },
      { label: "Revisi", value: "1x revisi minor" },
    ],
    tags: ["Japandi", "Kitchen"],
  },
  {
    id: 104,
    slug: "industrial-home-office",
    title: "Industrial Home Office",
    category: "Home Office",
    price: 280000,
    thumbnail: zhImg("catalog-104"),
    shortDescription: "Ruang kerja rumahan bergaya industrial dengan sentuhan besi dan kayu ekspos.",
    description: [
      "Cocok untuk area kecil di rumah yang ingin diubah menjadi ruang kerja produktif dengan karakter industrial yang kuat.",
      "Termasuk rekomendasi tata cahaya dan penyimpanan vertikal untuk ruang terbatas.",
    ],
    gallery: [zhImg("catalog-104-1"), zhImg("catalog-104-2")],
    specifications: [
      { label: "Format File", value: "PDF, SKP" },
      { label: "Luas Area", value: "2.5 x 2.8 m" },
      { label: "Jumlah Halaman", value: "10 halaman" },
      { label: "Revisi", value: "1x revisi minor" },
    ],
    tags: ["Industrial", "Home Office"],
  },
];

/* =============================================================================
 * 2. PACKAGE — paket layanan desain / project packaging (ada harga)
 * ============================================================================= */
const ZH_PACKAGE = [
  {
    id: 201,
    slug: "starter-design-package",
    title: "Starter Design Package",
    category: "1 Ruangan",
    price: 750000,
    thumbnail: zhImg("package-201"),
    shortDescription: "Paket ideal untuk mendesain 1 ruangan lengkap dari konsep hingga gambar kerja.",
    description: [
      "Paket ini cocok untuk klien yang ingin merenovasi atau menata ulang satu ruangan spesifik.",
      "Proses dimulai dari sesi konsultasi kebutuhan, moodboard, hingga gambar kerja siap eksekusi.",
    ],
    gallery: [zhImg("package-201-1"), zhImg("package-201-2"), zhImg("package-201-3")],
    specifications: [
      { label: "Cakupan", value: "1 ruangan" },
      { label: "Sesi Konsultasi", value: "2x online" },
      { label: "Output", value: "Moodboard + Gambar Kerja" },
      { label: "Estimasi Pengerjaan", value: "7–10 hari kerja" },
      { label: "Revisi", value: "2x revisi" },
    ],
    tags: ["Starter", "Populer"],
  },
  {
    id: 202,
    slug: "premium-full-house-package",
    title: "Premium Full House Package",
    category: "Full House",
    price: 4500000,
    thumbnail: zhImg("package-202"),
    shortDescription: "Layanan desain menyeluruh untuk seluruh area hunian, dari ruang tamu hingga taman belakang.",
    description: [
      "Paket paling komprehensif dari Zahasky — mencakup seluruh ruangan dalam satu hunian dengan konsep yang saling terhubung.",
      "Termasuk sesi tatap muka, kunjungan lokasi, dan pendampingan hingga tahap eksekusi.",
    ],
    gallery: [zhImg("package-202-1"), zhImg("package-202-2"), zhImg("package-202-3"), zhImg("package-202-4")],
    specifications: [
      { label: "Cakupan", value: "Seluruh rumah (hingga 120m²)" },
      { label: "Sesi Konsultasi", value: "Unlimited selama proyek" },
      { label: "Output", value: "Moodboard, Gambar Kerja, Render 3D, RAB" },
      { label: "Estimasi Pengerjaan", value: "30–45 hari kerja" },
      { label: "Revisi", value: "4x revisi" },
    ],
    tags: ["Premium", "Full House"],
  },
  {
    id: 203,
    slug: "commercial-office-package",
    title: "Commercial Office Package",
    category: "Komersial",
    price: 6000000,
    thumbnail: zhImg("package-203"),
    shortDescription: "Desain ruang kerja komersial yang mendukung produktivitas dan identitas brand.",
    description: [
      "Ditujukan untuk kantor startup, coworking space, maupun kantor korporat skala kecil-menengah.",
      "Fokus pada efisiensi ruang, zonasi kerja, dan konsistensi brand identity.",
    ],
    gallery: [zhImg("package-203-1"), zhImg("package-203-2"), zhImg("package-203-3")],
    specifications: [
      { label: "Cakupan", value: "Hingga 200m²" },
      { label: "Sesi Konsultasi", value: "5x sesi" },
      { label: "Output", value: "Space Planning, Render 3D, RAB" },
      { label: "Estimasi Pengerjaan", value: "20–30 hari kerja" },
      { label: "Revisi", value: "3x revisi" },
    ],
    tags: ["Commercial", "Office"],
  },
  {
    id: 204,
    slug: "renovation-consultation-package",
    title: "Renovation Consultation Package",
    category: "Konsultasi",
    price: 500000,
    thumbnail: zhImg("package-204"),
    shortDescription: "Sesi konsultasi intensif untuk perencanaan renovasi sebelum masuk tahap desain penuh.",
    description: [
      "Cocok untuk klien yang masih di tahap perencanaan awal dan butuh arahan profesional sebelum berkomitmen pada paket desain penuh.",
      "Hasil sesi berupa rekomendasi tertulis dan estimasi anggaran kasar.",
    ],
    gallery: [zhImg("package-204-1"), zhImg("package-204-2")],
    specifications: [
      { label: "Cakupan", value: "1x sesi (90 menit)" },
      { label: "Format", value: "Online / Onsite" },
      { label: "Output", value: "Rekomendasi tertulis + estimasi budget" },
      { label: "Estimasi Pengerjaan", value: "3 hari kerja" },
    ],
    tags: ["Konsultasi"],
  },
];

/* =============================================================================
 * 3. PUBLICITY — liputan media, penghargaan, dan kolaborasi (tanpa harga)
 * ============================================================================= */
const ZH_PUBLICITY = [
  {
    id: 301,
    slug: "featured-architectural-digest-2025",
    title: "Featured on Architectural Digest 2025",
    category: "Media Feature",
    price: null,
    publisher: "Architectural Digest Indonesia",
    date: "12 Maret 2025",
    thumbnail: zhImg("publicity-301"),
    shortDescription: "Proyek renovasi rumah tinggal di Bandung yang diulas sebagai salah satu desain interior terbaik tahun ini.",
    description: [
      "Zahasky dipercaya menjadi salah satu studio yang diulas dalam edisi khusus 'Emerging Talents' oleh Architectural Digest Indonesia.",
      "Liputan ini membahas pendekatan desain earthy-minimalist yang menjadi ciri khas studio.",
    ],
    gallery: [zhImg("publicity-301-1"), zhImg("publicity-301-2"), zhImg("publicity-301-3")],
    specifications: [
      { label: "Publikasi", value: "Architectural Digest Indonesia" },
      { label: "Tanggal Terbit", value: "12 Maret 2025" },
      { label: "Kategori", value: "Media Feature" },
      { label: "Lokasi Proyek", value: "Bandung, Jawa Barat" },
    ],
    tags: ["Media", "Feature"],
  },
  {
    id: 302,
    slug: "zahasky-x-idea-magazine",
    title: "Zahasky x IDEA Magazine Collaboration",
    category: "Kolaborasi",
    price: null,
    publisher: "IDEA Magazine",
    date: "28 Agustus 2025",
    thumbnail: zhImg("publicity-302"),
    shortDescription: "Kolaborasi khusus menghadirkan seri artikel 'Desain Hunian Tropis Modern' bersama IDEA Magazine.",
    description: [
      "Seri kolaborasi ini menampilkan proses kreatif tim Zahasky dalam merancang tiga hunian bertema tropis modern.",
      "Artikel mencakup wawancara eksklusif dengan lead designer studio.",
    ],
    gallery: [zhImg("publicity-302-1"), zhImg("publicity-302-2")],
    specifications: [
      { label: "Publikasi", value: "IDEA Magazine" },
      { label: "Tanggal Terbit", value: "28 Agustus 2025" },
      { label: "Kategori", value: "Kolaborasi" },
    ],
    tags: ["Kolaborasi", "Majalah"],
  },
  {
    id: 303,
    slug: "best-emerging-studio-award",
    title: "Best Emerging Interior Studio Award",
    category: "Penghargaan",
    price: null,
    publisher: "Indonesia Design Award",
    date: "15 November 2025",
    thumbnail: zhImg("publicity-303"),
    shortDescription: "Zahasky meraih penghargaan sebagai studio interior pendatang baru terbaik 2025.",
    description: [
      "Penghargaan ini diberikan atas konsistensi kualitas desain dan pertumbuhan portofolio Zahasky sepanjang tahun 2025.",
      "Penilaian dilakukan oleh dewan juri independen dari kalangan arsitek dan desainer senior.",
    ],
    gallery: [zhImg("publicity-303-1"), zhImg("publicity-303-2"), zhImg("publicity-303-3")],
    specifications: [
      { label: "Penyelenggara", value: "Indonesia Design Award" },
      { label: "Tanggal", value: "15 November 2025" },
      { label: "Kategori", value: "Best Emerging Studio" },
    ],
    tags: ["Award", "Penghargaan"],
  },
  {
    id: 304,
    slug: "interior-week-bandung-2026",
    title: "Guest Speaker — Interior Week Bandung 2026",
    category: "Event",
    price: null,
    publisher: "Interior Week Bandung",
    date: "20 Januari 2026",
    thumbnail: zhImg("publicity-304"),
    shortDescription: "Founder Zahasky menjadi pembicara pada sesi 'Sustainable Interior for Tropical Homes'.",
    description: [
      "Sesi ini membahas penerapan material lokal dan strategi hemat energi dalam desain interior hunian tropis.",
      "Dihadiri lebih dari 300 peserta dari kalangan mahasiswa dan praktisi desain.",
    ],
    gallery: [zhImg("publicity-304-1"), zhImg("publicity-304-2")],
    specifications: [
      { label: "Penyelenggara", value: "Interior Week Bandung" },
      { label: "Tanggal", value: "20 Januari 2026" },
      { label: "Peran", value: "Guest Speaker" },
    ],
    tags: ["Event", "Speaker"],
  },
];

// -----------------------------------------------------------------------
// REGISTRY: memetakan nama koleksi ('catalog' | 'package' | 'publicity')
// ke array data-nya masing-masing. Dipakai secara internal oleh fungsi
// mockFetchList() / mockFetchDetail() di bawah supaya satu set fungsi
// generik bisa dipakai ulang oleh ketiga halaman (catalog/package/publicity.html).
// -----------------------------------------------------------------------
const ZH_COLLECTIONS = {
  catalog: ZH_CATALOG,
  package: ZH_PACKAGE,
  publicity: ZH_PUBLICITY,
};

/**
 * -----------------------------------------------------------------------
 * FUNCTION: mockFetchList(collectionType)
 * -----------------------------------------------------------------------
 * Simulasi pemanggilan API Express -> Odoo XML-RPC untuk mengambil
 * SELURUH item pada satu koleksi (dipakai untuk render Grid List View).
 *
 * Simulasi delay jaringan (400ms) sengaja ditambahkan supaya skeleton
 * loading di halaman terlihat nyata & tim terbiasa menangani state
 * "loading" seperti saat nanti fetch beneran ke backend.
 *
 * TODO (Integrasi Odoo asli):
 *   Ganti isi fungsi ini dengan:
 *     const res = await fetch(`/api/${collectionType}`);
 *     const json = await res.json();
 *     return json.products; // atau field sesuai response Express
 *   Endpoint Express-nya sendiri di baliknya akan memanggil
 *   objectClient.methodCall('execute_kw', [..., 'product.template',
 *   'search_read', [[['x_collection_type', '=', collectionType]]], {...}])
 *   (lihat backend/odooService.js).
 *
 * @param {string} collectionType - 'catalog' | 'package' | 'publicity'
 * @returns {Promise<Array>} array item TANPA field berat (description,
 *          gallery, specifications) — mirip response list view API asli
 *          yang biasanya tidak mengirim field besar demi performa.
 * -----------------------------------------------------------------------
 */
function mockFetchList(collectionType) {
  return new Promise((resolve) => {
    setTimeout(function () {
      const items = ZH_COLLECTIONS[collectionType] || [];
      // Strip field berat, sisakan field ringan saja untuk grid card
      const lightweight = items.map(function (item) {
        const clone = Object.assign({}, item);
        delete clone.description;
        delete clone.gallery;
        delete clone.specifications;
        return clone;
      });
      resolve(lightweight);
    }, 400); // simulasi latensi jaringan
  });
}

/**
 * -----------------------------------------------------------------------
 * FUNCTION: mockFetchDetail(collectionType, slug)
 * -----------------------------------------------------------------------
 * Simulasi pemanggilan API Express -> Odoo XML-RPC untuk mengambil
 * SATU item spesifik berdasarkan slug URL (dipakai untuk render Detail
 * View), LENGKAP dengan field description/gallery/specifications, plus
 * daftar "related items" (item lain di kategori yang sama).
 *
 * TODO (Integrasi Odoo asli):
 *   Ganti isi fungsi ini dengan:
 *     const res = await fetch(`/api/${collectionType}/${slug}`);
 *     const json = await res.json();
 *     return json.product; // detail + related dari backend
 *   Endpoint Express-nya akan memanggil search_read dengan domain
 *   [['x_slug', '=', slug]] ke Odoo.
 *
 * @param {string} collectionType - 'catalog' | 'package' | 'publicity'
 * @param {string} slug - slug unik item, diambil dari query string URL
 * @returns {Promise<Object|null>} object item lengkap + field `related`
 *          (array maksimal 3-4 item terkait), atau null jika slug tidak ditemukan.
 * -----------------------------------------------------------------------
 */
function mockFetchDetail(collectionType, slug) {
  return new Promise((resolve) => {
    setTimeout(function () {
      const items = ZH_COLLECTIONS[collectionType] || [];
      const item = items.find(function (i) {
        return i.slug === slug;
      });

      if (!item) {
        resolve(null);
        return;
      }

      // Cari related items: prioritaskan kategori yang sama, lalu isi
      // sisa slot dengan item lain jika kurang dari 3.
      const stripHeavyFields = function (i) {
        const clone = Object.assign({}, i);
        delete clone.description;
        delete clone.gallery;
        delete clone.specifications;
        return clone;
      };

      let related = items
        .filter(function (i) {
          return i.slug !== slug && i.category === item.category;
        })
        .slice(0, 4)
        .map(stripHeavyFields);

      if (related.length < 3) {
        const usedSlugs = related.map(function (r) {
          return r.slug;
        });
        const fillers = items
          .filter(function (i) {
            return i.slug !== slug && usedSlugs.indexOf(i.slug) === -1;
          })
          .slice(0, 3 - related.length)
          .map(stripHeavyFields);
        related = related.concat(fillers);
      }

      const fullItem = Object.assign({}, item, { related: related });
      resolve(fullItem);
    }, 400); // simulasi latensi jaringan
  });
}

/**
 * -----------------------------------------------------------------------
 * FUNCTION: mockSubmitInquiry(payload)
 * -----------------------------------------------------------------------
 * Simulasi pengiriman form "CTA Inquiry" (nama, email/WA, pesan, slug
 * item terkait) ke backend. Backend asli nantinya bisa membuat Lead /
 * CRM record di Odoo (model 'crm.lead') via XML-RPC, atau kirim email
 * notifikasi ke tim sales Zahasky.
 *
 * TODO (Integrasi Odoo asli):
 *   const res = await fetch('/api/inquiry', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   });
 *   return res.json();
 *
 * @param {Object} payload - { name, contact, message, itemSlug, itemTitle, collectionType }
 * @returns {Promise<{success: boolean}>}
 * -----------------------------------------------------------------------
 */
function mockSubmitInquiry(payload) {
  return new Promise((resolve) => {
    setTimeout(function () {
      // eslint-disable-next-line no-console
      console.log("[mockSubmitInquiry] Payload terkirim (simulasi):", payload);
      resolve({ success: true });
    }, 600);
  });
}