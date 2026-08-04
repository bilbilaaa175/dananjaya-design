const xmlrpc = require('xmlrpc');

// Konfigurasi Akun Odoo yang sudah terbukti sukses di Postman tadi
const config = {
    url: process.env.ODOO_URL,
    db: process.env.ODOO_DB, 
    username: process.env.ODOO_USERNAME,
    password: process.env.ODOO_PASSWORD
};

// Menghubungkan client Node.js ke alamat API Odoo
const commonClient = xmlrpc.createClient({ url: `${config.url}/xmlrpc/2/common` });
const objectClient = xmlrpc.createClient({ url: `${config.url}/xmlrpc/2/object` });

// 1. Fungsi internal untuk login (mendapatkan User ID secara otomatis)
function getUserId() {
    return new Promise((resolve, reject) => {
        commonClient.methodCall('authenticate', [config.db, config.username, config.password, {}], (err, uid) => {
            if (err) return reject(err);
            if (!uid) return reject(new Error("Gagal login, periksa username/password!"));
            resolve(uid);
        });
    });
}

// 2. Fungsi utama untuk mengambil daftar produk dari Odoo
async function getProducts() {
    try {
        const uid = await getUserId();
        console.log(`✓ Berhasil terkoneksi ke Odoo. Menggunakan User ID: ${uid}`);

        return new Promise((resolve, reject) => {
            objectClient.methodCall('execute_kw', [
                config.db,
                uid,
                config.password,
                'product.template',
                'search_read',
                [[]],
                { fields: ['name', 'list_price'], limit: 100 }
            ], (err, products) => {
                if (err) return reject(err);
                resolve(products);
            });
        });
    } catch (error) {
        throw error;
    }
}

// 3. Fungsi untuk membuat Sales Order (Quotation) baru di Odoo
async function createSalesOrder(partnerId, productId, productName, price) {
    const uid = await getUserId();
    
    return new Promise((resolve, reject) => {
        // 1. Cari ID varian riil (product.product) berdasarkan ID template dari produk
        objectClient.methodCall('execute_kw', [
            config.db, uid, config.password,
            'product.product',
            'search',
            [[['product_tmpl_id', '=', parseInt(productId)]]] // Mencari varian berdasarkan ID template
        ], (variantErr, variantIds) => {
            if (variantErr) return reject(variantErr);

            // Gunakan ID varian yang ketemu, kalau kosong fallback ke ID productId langsung
            const realProductId = (variantIds && variantIds.length > 0) ? variantIds[0] : parseInt(productId);

            // 2. Ambil default value bawaan Odoo biar field wajib gak ada yang terlewat
            objectClient.methodCall('execute_kw', [
                config.db, uid, config.password,
                'sale.order', 'default_get',
                [['pricelist_id', 'warehouse_id', 'team_id']]
            ], (defaultErr, defaultValues) => {
                if (defaultErr) return reject(defaultErr);

                const orderData = {
                    ...defaultValues,
                    'partner_id': partnerId || 1, 
                    'order_line': [
                        [0, 0, {
                            'product_id': realProductId, // Pakai ID varian riil hasil tracking Odoo
                            'name': productName,
                            'price_unit': parseFloat(price),
                            'product_uom_qty': 1,
                        }]
                    ]
                };

                // 3. Eksekusi Create Order
                objectClient.methodCall('execute_kw', [
                    config.db, uid, config.password,
                    'sale.order', 'create',
                    [orderData]
                ], (createErr, orderId) => {
                    if (createErr) return reject(createErr);
                    resolve(orderId);
                });
            });
        });
    });
}

// 4. FUNGSI BARU: Mengonfirmasi Quotation menjadi Sales Order Terbayar (Dipanggil oleh Webhook)
async function confirmSalesOrder(orderId) {
    const uid = await getUserId(); // Mengambil uid secara asinkron untuk otentikasi aman

    return new Promise((resolve, reject) => {
        objectClient.methodCall('execute_kw', [
            config.db,
            uid,
            config.password,
            'sale.order',
            'action_confirm', // Workflow method Odoo untuk mengubah status menjadi 'Sale'
            [[orderId]]       // Menerima ID record dalam bentuk array multidimensi [[ID]]
        ], (err, result) => {
            if (err) {
                console.error(`✗ Gagal mengonfirmasi Order ID ${orderId} di Odoo:`, err);
                return reject(err);
            }
            console.log(`✓ [Odoo] Order ID ${orderId} berhasil otomatis dikonfirmasi menjadi Sales Order!`);
            resolve(result);
        });
    });
}

// 5. FUNGSI BARU: Mengambil Link Google Drive Produk
async function getDigitalFileUrl(productId) {
    const uid = await getUserId();

    return new Promise((resolve, reject) => {
        objectClient.methodCall('execute_kw', [
            config.db,
            uid,
            config.password,
            'product.template',
            'search_read',
            [[['id', '=', parseInt(productId)]]],
            { fields: ['name', 'x_digital_file_url'] } // Ambil field custom kita
        ], (err, products) => {
            if (err) return reject(err);
            if (!products || products.length === 0) return reject(new Error('Produk tidak ditemukan'));

            // Mengembalikan string link Google Drive
            resolve(products[0].x_digital_file_url || null);
        });
    });
}

// 6. FUNGSI BARU: Ambil Link Google Drive Langsung dari Sales Order ID
async function getDigitalUrlByOrderId(orderId) {
    const uid = await getUserId();

    return new Promise((resolve, reject) => {
        // Step A: Read Sales Order untuk ambil order_line
        objectClient.methodCall('execute_kw', [
            config.db, uid, config.password,
            'sale.order', 'read',
            [[parseInt(orderId)]],
            { fields: ['order_line'] }
        ], (err, orders) => {
            if (err) return reject(err);
            if (!orders || orders.length === 0 || orders[0].order_line.length === 0) {
                return reject(new Error('Sales Order tidak ditemukan atau tidak memiliki produk'));
            }

            const lineId = orders[0].order_line[0]; // Line produk pertama

            // Step B: Read Sale Order Line untuk ambil product_id
            objectClient.methodCall('execute_kw', [
                config.db, uid, config.password,
                'sale.order.line', 'read',
                [[lineId]],
                { fields: ['product_id'] }
            ], (lineErr, lines) => {
                if (lineErr) return reject(lineErr);
                if (!lines || lines.length === 0) return reject(new Error('Order line tidak ditemukan'));

                const productId = lines[0].product_id[0]; // ID Varian/Template produk

                // Step C: Read Product Template / Variant untuk ambil x_digital_file_url
                objectClient.methodCall('execute_kw', [
                    config.db, uid, config.password,
                    'product.product', 'read',
                    [[productId]],
                    { fields: ['x_digital_file_url'] }
                ], (prodErr, products) => {
                    if (prodErr) return reject(prodErr);
                    if (!products || products.length === 0) return reject(new Error('Produk tidak ditemukan'));

                    resolve({
                        productId: productId,
                        driveLink: products[0].x_digital_file_url || null
                    });
                });
            });
        });
    });
}

module.exports = { getProducts, createSalesOrder, confirmSalesOrder, getDigitalFileUrl, getDigitalUrlByOrderId };