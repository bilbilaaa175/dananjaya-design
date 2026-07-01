// ============================================================
//  cart.js — Cart (Add, Remove, Update Quantity, Badge, Sync)
// ============================================================

import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// Cart disimpan di memory selama sesi berlangsung
let localCart = [];

// ── Update badge angka di icon cart ──
export function updateCartBadge() {
  const total = localCart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cartBadge').forEach(badge => {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ── Load cart dari Supabase (saat login) ──
export async function loadCart(userId) {
  const { data, error } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) { console.error('Load cart error:', error); return; }

  localCart = data || [];
  updateCartBadge();
}

// ── Tambah produk ke cart ──
export async function addToCart({ productId, productName, productPrice, productImg, productCat }) {
  const user = await getUser();

  // Jika belum login, buka modal login
  if (!user) {
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();
    return;
  }

  // Cek apakah produk sudah ada di cart
  const existing = localCart.find(item => item.product_id === productId);

  if (existing) {
    await updateQuantity(productId, existing.quantity + 1);
    return;
  }

  // Insert ke Supabase
  const { data, error } = await supabase
    .from('cart')
    .insert({
      user_id:       user.id,
      product_id:    productId,
      product_name:  productName,
      product_price: productPrice,
      product_img:   productImg || '',
      product_cat:   productCat || '',
      quantity:      1
    })
    .select()
    .single();

  if (error) { console.error('Add to cart error:', error); return; }

  localCart.push(data);
  updateCartBadge();
  showCartToast(productName);
}

// ── Update quantity produk ──
export async function updateQuantity(productId, newQuantity) {
  const user = await getUser();
  if (!user) return;

  if (newQuantity < 1) {
    await removeFromCart(productId);
    return;
  }

  const { error } = await supabase
    .from('cart')
    .update({ quantity: newQuantity })
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) { console.error('Update quantity error:', error); return; }

  const item = localCart.find(i => i.product_id === productId);
  if (item) item.quantity = newQuantity;

  updateCartBadge();
  renderCartDropdown();
}

// ── Hapus produk dari cart ──
export async function removeFromCart(productId) {
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) { console.error('Remove from cart error:', error); return; }

  localCart = localCart.filter(i => i.product_id !== productId);
  updateCartBadge();
  renderCartDropdown();
}

// ── Kosongkan cart lokal (saat logout) ──
export function clearLocalCart() {
  localCart = [];
  updateCartBadge();
}

// ── Hitung total harga ──
export function getCartTotal() {
  return localCart.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
}

// ── Format harga ke Rupiah ──
export function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

// ── Update cart item count label ──
function updateCartCount() {
  const countEl = document.getElementById('cartItemCount');
  if (!countEl) return;
  const total = localCart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = `${total} item`;
}

// ── Render isi cart di dropdown ──
export function renderCartDropdown() {
  const container = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  if (!container) return;

  if (localCart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4" style="color:var(--dark-gray)">
        <i class="bi bi-bag" style="font-size:2rem;opacity:0.3"></i>
        <p class="mt-2 mb-0" style="font-size:0.85rem">Cart kosong</p>
      </div>`;
    if (totalEl) totalEl.textContent = formatRupiah(0);
    updateCartCount();
    return;
  }

  container.innerHTML = localCart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <p class="mb-0" style="font-size:0.85rem;font-weight:600;color:var(--black)">${item.product_name}</p>
        <p class="mb-0" style="font-size:0.75rem;color:var(--wood)">${formatRupiah(item.product_price)}</p>
      </div>
      <div class="d-flex align-items-center gap-1">
        <button class="btn-qty" onclick="window.cartUpdateQty('${item.product_id}', ${item.quantity - 1})">
          <i class="bi bi-dash"></i>
        </button>
        <span style="font-size:0.85rem;font-weight:600;min-width:20px;text-align:center">${item.quantity}</span>
        <button class="btn-qty" onclick="window.cartUpdateQty('${item.product_id}', ${item.quantity + 1})">
          <i class="bi bi-plus"></i>
        </button>
      </div>
      <button class="btn-qty text-danger" onclick="window.cartRemove('${item.product_id}')">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = formatRupiah(getCartTotal());
  updateCartCount();
}

// ── Toast notifikasi ──
function showCartToast(productName) {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.innerHTML = `
    <div style="
      position:fixed; bottom:24px; right:24px; z-index:9999;
      background:var(--black); color:#fff; padding:12px 20px;
      border-radius:8px; font-size:0.82rem; display:flex;
      align-items:center; gap:10px; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
      <i class="bi bi-bag-check" style="color:var(--wood);font-size:1rem"></i>
      <span><strong>${productName}</strong> ditambahkan ke cart</span>
    </div>`;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ── Expose ke window untuk onclick di HTML ──
window.cartUpdateQty = updateQuantity;
window.cartRemove    = removeFromCart;