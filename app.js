// Load environment variables dari .env paling awal
require('dotenv').config();

const path = require('path');
const express = require('express');
// Menggunakan cara import modular sesuai dengan SDK Xendit versi terbaru
const { Xendit } = require('xendit-node'); 
// Tambahkan confirmSalesOrder ke dalam list destructuring import dari odooService
const { getProducts, createSalesOrder, confirmSalesOrder, getDigitalFileUrl, getDigitalUrlByOrderId } = require('./odooService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Menyajikan frontend skeleton (public/index.html, assets, dll)
app.use(express.static(path.join(__dirname, 'public')));

// Inisialisasi Xendit menggunakan SDK versi terbaru
const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY
});

// Mengambil modul Invoice dari instance xenditClient
const { Invoice } = xenditClient;

// =========================================================================
// Endpoint 1: Ambil Produk dari Odoo (Via XML-RPC)
// =========================================================================
app.get('/api/products', async (req, res) => {
    try {
        const odooData = await getProducts();
        res.json({ success: true, products: odooData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// Endpoint 2: Proses Checkout (Buat SO di Odoo + Buat Invoice di Xendit)
// =========================================================================
app.post('/api/checkout', async (req, res) => {
    try {
        // Tambahkan productId dikirim dari Postman
        const { productId, productName, price, customerEmail } = req.body; 

        // 1. Buat data Sales Order di Odoo 19 dengan Product ID asli
        const odooOrderId = await createSalesOrder(1, productId, productName, price);
        console.log(`✓ Sales Order sukses dibuat di Odoo dengan ID: ${odooOrderId}`);

        // 2. Buat Invoice / Link Pembayaran di Xendit
        const xenditInvoice = await Invoice.createInvoice({
            data: {
                externalId: `odoo-order-${odooOrderId}`,
                amount: price,
                payerEmail: customerEmail,
                description: `Pembayaran untuk ${productName} (Odoo SO #${odooOrderId})`,
                invoiceDuration: '86400',
                items: [
                    {
                        name: productName,
                        price: price,
                        quantity: 1,
                        category: 'Digital Product',
                        // Kita simpan productId Odoo di sini agar bisa diambil pas webhook masuk
                        referenceId: String(productId) 
                    }
                ]
            }
        });

        res.json({
            success: true,
            message: "Order berhasil dibuat!",
            orderId: odooOrderId,
            paymentUrl: xenditInvoice.invoiceUrl
        });

    } catch (error) {
        console.error("Detail Error:", error);
        res.status(500).json({ success: false, message: "Checkout gagal", error: error.message });
    }
});

// =========================================================================
// Endpoint 3: Webhook Xendit (Menerima Notifikasi Bayar Otomatis)
// =========================================================================
app.post('/api/webhook/xendit', async (req, res) => {
    try {
        // 1. Verifikasi Verification Token dari Header HTTP Xendit
        const xenditTokenHeader = req.headers['x-callback-token'];

        if (xenditTokenHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
            console.warn("⚠️ [SECURITY ALERT] Webhook ditolak! Verification Token tidak cocok.");
            return res.status(403).json({ success: false, message: "Invalid Verification Token" });
        }

        // 2. Baca Data dari Xendit
        const callbackData = req.body;
        const externalId = callbackData.external_id || callbackData.externalId;
        const status = callbackData.status || callbackData.paid_status;

        console.log(`[Webhook] Notifikasi masuk dari Xendit untuk ID: ${externalId}`);

        // 3. Validasi apakah status pembayaran adalah PAID
        if (status === 'PAID' || status === 'COMPLETED' || status === 'SETTLED') {
            if (externalId && externalId.includes('odoo-order-')) {
                const odooOrderId = parseInt(externalId.split('-').pop());

                console.log(`[Webhook] Pembayaran LUNAS. Memproses konfirmasi untuk Odoo Order ID: ${odooOrderId}`);
                
                // A. Ubah status Quotation -> Sales Order di Odoo
                await confirmSalesOrder(odooOrderId);
                console.log(`✓ [Webhook] Odoo Order ID ${odooOrderId} sukses diperbarui secara otomatis.`);

                // B. Ambil Link Google Drive berdasarkan Order ID
                try {
                    const result = await getDigitalUrlByOrderId(odooOrderId);

                    console.log(`\n🎉 [DIGITAL DELIVERY SUCCESS]`);
                    console.log(`📦 Produk ID: ${result.productId}`);
                    console.log(`📧 Customer: ${callbackData.payer_email || callbackData.payerEmail || 'Customer'}`);
                    console.log(`🔗 Link Download (Google Drive): ${result.driveLink}`);
                    console.log(`--------------------------------------------------\n`);

                } catch (digitalErr) {
                    console.error("⚠️ Gagal mengambil digital link:", digitalErr.message);
                }
            }
        }

        // Respon 200 OK cepat ke Xendit
        return res.status(200).json({ success: true, message: "Webhook processed successfully" });

    } catch (error) {
        console.error("❌ [Webhook Error]:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// Menjalankan Server Middleware Node.js
// =========================================================================
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});