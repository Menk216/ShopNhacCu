/**
 * Customer Frontend Logic (Music Store)
 */

let currentFilters = {
    page: 1,
    limit: 8,
    category_id: null,
    q: '',
    min_price: null,
    max_price: null,
    sort: 'newest'
};

// Initialize index page if elements exist
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we're on product listing page
    if (document.getElementById('productGrid')) {
        initProductCatalog();
    }

    // 2. Check if we're on cart page
    if (document.getElementById('cartTableBody')) {
        loadCartPage();
    }

    // 3. Check if we're on checkout page
    if (document.getElementById('checkoutForm')) {
        initCheckoutPage();
    }

    // 4. Check if on orders page
    if (document.getElementById('customerOrdersList')) {
        loadCustomerOrders();
    }

    // 5. Check if on profile page
    if (document.getElementById('profileForm')) {
        loadCustomerProfile();
    }
});

// ================= PRODUCT CATALOG & SEARCH =================

function initProductCatalog() {
    // Check URL params for category or query
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('category_id')) {
        currentFilters.category_id = parseInt(urlParams.get('category_id'));
        const catSelect = document.getElementById('searchCategory');
        if (catSelect) catSelect.value = currentFilters.category_id;
    }
    if (urlParams.get('q')) {
        currentFilters.q = urlParams.get('q');
        const searchInput = document.getElementById('searchKeyword');
        if (searchInput) searchInput.value = currentFilters.q;
    }

    // Advanced search submit
    const searchForm = document.getElementById('advancedSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentFilters.q = document.getElementById('searchKeyword').value.trim();
            currentFilters.category_id = document.getElementById('searchCategory').value ? parseInt(document.getElementById('searchCategory').value) : null;
            
            const minP = document.getElementById('searchMinPrice').value;
            const maxP = document.getElementById('searchMaxPrice').value;
            currentFilters.min_price = minP ? parseFloat(minP) : null;
            currentFilters.max_price = maxP ? parseFloat(maxP) : null;
            
            currentFilters.page = 1;
            fetchAndRenderProducts();
        });
    }

    // Quick search from header
    const quickSearchForm = document.getElementById('quickSearchForm');
    if (quickSearchForm) {
        quickSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('quickSearchInput').value.trim();
            if (window.location.pathname !== '/') {
                window.location.href = `/?q=${encodeURIComponent(val)}`;
            } else {
                currentFilters.q = val;
                const kwInput = document.getElementById('searchKeyword');
                if (kwInput) kwInput.value = val;
                currentFilters.page = 1;
                fetchAndRenderProducts();
            }
        });
    }

    fetchAndRenderProducts();
}

function resetAdvancedSearch() {
    document.getElementById('searchKeyword').value = '';
    document.getElementById('searchCategory').value = '';
    document.getElementById('searchMinPrice').value = '';
    document.getElementById('searchMaxPrice').value = '';
    currentFilters = {
        page: 1,
        limit: 8,
        category_id: null,
        q: '',
        min_price: null,
        max_price: null,
        sort: 'newest'
    };
    fetchAndRenderProducts();
}

function filterByCategory(categoryId, element) {
    currentFilters.category_id = categoryId;
    currentFilters.page = 1;
    const catSelect = document.getElementById('searchCategory');
    if (catSelect) catSelect.value = categoryId || '';

    // Update active class on sub-nav
    document.querySelectorAll('.sub-nav-link').forEach(el => el.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }

    fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: #64748b;">Đang tải danh sách nhạc cụ...</div>';

    let url = `/api/products?page=${currentFilters.page}&limit=${currentFilters.limit}`;
    if (currentFilters.category_id) url += `&category_id=${currentFilters.category_id}`;
    if (currentFilters.q) url += `&q=${encodeURIComponent(currentFilters.q)}`;
    if (currentFilters.min_price) url += `&min_price=${currentFilters.min_price}`;
    if (currentFilters.max_price) url += `&max_price=${currentFilters.max_price}`;
    if (currentFilters.sort) url += `&sort=${currentFilters.sort}`;

    try {
        const res = await fetchAPI(url);
        if (!res.products || res.products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 1rem;">Không tìm thấy sản phẩm nhạc cụ nào phù hợp với yêu cầu.</p>
                    <button class="btn btn-secondary" onclick="resetAdvancedSearch()">Xóa bộ lọc & Xem tất cả</button>
                </div>
            `;
            renderPagination(0, 1, 1);
            return;
        }

        grid.innerHTML = res.products.map(p => renderProductCard(p)).join('');
        renderPagination(res.pagination.total_items, res.pagination.total_pages, res.pagination.current_page);

        // Update result title
        const titleEl = document.getElementById('catalogTitle');
        if (titleEl) {
            if (currentFilters.q) {
                titleEl.textContent = `Kết quả tìm kiếm cho: "${currentFilters.q}" (${res.pagination.total_items} sản phẩm)`;
            } else if (currentFilters.category_id) {
                const catName = res.products[0]?.category_name || 'Danh mục';
                titleEl.textContent = `${catName} (${res.pagination.total_items} sản phẩm)`;
            } else {
                titleEl.textContent = `Tất cả nhạc cụ (${res.pagination.total_items} sản phẩm)`;
            }
        }
    } catch (e) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #ef4444;">Lỗi tải dữ liệu: ${e.message}</div>`;
    }
}

function renderProductCard(p) {
    let stockBadge = '<span class="stock-tag in-stock">Còn hàng</span>';
    let isOutOfStock = false;
    if (p.stock_quantity <= 0) {
        stockBadge = '<span class="stock-tag out-of-stock">Hết hàng</span>';
        isOutOfStock = true;
    } else if (p.stock_quantity <= 5) {
        stockBadge = `<span class="stock-tag low-stock">Chỉ còn ${p.stock_quantity}</span>`;
    }

    return `
        <div class="product-card">
            <div class="product-thumb-wrap">
                <img class="product-thumb" src="${p.image_url}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'">
                ${stockBadge}
            </div>
            <div class="product-body">
                <span class="product-category-name">${p.category_name}</span>
                <a href="/product/${p.id}" class="product-title" title="${p.name}">${p.name}</a>
                <div class="product-price-row">
                    <span class="product-price">${formatVND(p.selling_price)}</span>
                    <button class="btn-add-cart" onclick="handleAddToCart(${p.id}, 1)" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderPagination(totalItems, totalPages, currentPage) {
    const wrap = document.getElementById('paginationWrap');
    if (!wrap) return;

    if (totalPages <= 1) {
        wrap.innerHTML = '';
        return;
    }

    let html = `
        <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Trước</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span style="padding: 0 4px; color: #94a3b8;">...</span>`;
        }
    }

    html += `
        <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Sau &raquo;</button>
    `;

    wrap.innerHTML = html;
}

function goToPage(page) {
    currentFilters.page = page;
    fetchAndRenderProducts();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

// ================= CART OPERATIONS =================

async function handleAddToCart(productId, quantity = 1) {
    try {
        const res = await fetchAPI('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
        showToast(res.message, 'success');
        updateCartBadge(res.total_count);
    } catch (err) {
        // fetchAPI handles 401 redirect
        if (!err.message.includes('đăng nhập')) {
            showToast(err.message, 'error');
        }
    }
}

function updateCartBadge(count) {
    const badge = document.getElementById('cartBadgeCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

async function loadCartPage() {
    const tbody = document.getElementById('cartTableBody');
    const emptyState = document.getElementById('cartEmptyState');
    const contentLayout = document.getElementById('cartContentLayout');

    try {
        const res = await fetchAPI('/api/cart');
        if (!res.cart_items || res.cart_items.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (contentLayout) contentLayout.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (contentLayout) contentLayout.style.display = 'grid';

        tbody.innerHTML = res.cart_items.map(item => `
            <tr>
                <td style="display:flex; align-items:center; gap: 1rem;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 2px;">${item.name}</div>
                        <div style="font-size: 0.8rem; color: #64748b;">Mã: ${item.code} | Kho: ${item.stock_quantity}</div>
                    </div>
                </td>
                <td style="font-weight: 600;">${formatVND(item.unit_price)}</td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeCartQty(${item.cart_item_id}, ${item.quantity - 1})">-</button>
                        <input class="qty-input" type="text" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="changeCartQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td style="font-weight: 700; color: #b45309;">${formatVND(item.subtotal)}</td>
                <td>
                    <button class="btn-remove-item" onclick="removeCartItem(${item.cart_item_id})" title="Xóa">&times;</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('cartSubtotal').textContent = formatVND(res.total_amount);
        document.getElementById('cartTotal').textContent = formatVND(res.total_amount);
        updateCartBadge(res.item_count);
    } catch (e) {
        console.error(e);
    }
}

async function changeCartQty(cartItemId, newQty) {
    if (newQty <= 0) {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    }
    try {
        await fetchAPI('/api/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQty })
        });
        loadCartPage();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function removeCartItem(cartItemId) {
    if (!confirm('Xác nhận xóa sản phẩm khỏi giỏ hàng?')) return;
    try {
        await fetchAPI('/api/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({ cart_item_id: cartItemId })
        });
        showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
        loadCartPage();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ================= CHECKOUT PAGE =================

function initCheckoutPage() {
    loadCheckoutSummary();

    // Toggle address mode
    const modeProfile = document.getElementById('addrModeProfile');
    const modeNew = document.getElementById('addrModeNew');
    const newAddrFields = document.getElementById('newAddressFields');
    const profileAddrPreview = document.getElementById('profileAddressPreview');

    if (modeProfile && modeNew) {
        modeProfile.addEventListener('change', () => {
            if (modeProfile.checked) {
                newAddrFields.style.display = 'none';
                profileAddrPreview.style.display = 'block';
            }
        });
        modeNew.addEventListener('change', () => {
            if (modeNew.checked) {
                newAddrFields.style.display = 'block';
                profileAddrPreview.style.display = 'none';
            }
        });
    }

    // Toggle payment method extra info (e.g. Bank Transfer QR code)
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    const bankTransferInfo = document.getElementById('bankTransferInfo');
    const onlinePaymentInfo = document.getElementById('onlinePaymentInfo');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (bankTransferInfo) bankTransferInfo.style.display = radio.value === 'bank_transfer' ? 'block' : 'none';
            if (onlinePaymentInfo) onlinePaymentInfo.style.display = radio.value === 'online' ? 'block' : 'none';
        });
    });

    // Form submit
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const addressMode = document.querySelector('input[name="address_mode"]:checked').value;
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        const notes = document.getElementById('orderNotes').value.trim();

        const payload = {
            address_mode: addressMode,
            payment_method: paymentMethod,
            notes: notes
        };

        if (addressMode === 'new') {
            payload.recipient_name = document.getElementById('newRecipientName').value.trim();
            payload.recipient_phone = document.getElementById('newRecipientPhone').value.trim();
            payload.recipient_address = document.getElementById('newRecipientAddress').value.trim();

            if (!payload.recipient_name || !payload.recipient_phone || !payload.recipient_address) {
                showToast('Vui lòng điền đầy đủ họ tên, SĐT và địa chỉ giao hàng mới', 'error');
                return;
            }
        }

        try {
            const res = await fetchAPI('/api/checkout', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Đặt hàng thành công!', 'success');
            setTimeout(() => {
                window.location.href = `/order-success/${res.order_code}`;
            }, 500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

async function loadCheckoutSummary() {
    try {
        const res = await fetchAPI('/api/cart');
        if (!res.cart_items || res.cart_items.length === 0) {
            window.location.href = '/cart';
            return;
        }

        const summaryList = document.getElementById('checkoutItemsList');
        if (summaryList) {
            summaryList.innerHTML = res.cart_items.map(item => `
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.6rem; font-size: 0.9rem;">
                    <span>${item.name} <strong>&times; ${item.quantity}</strong></span>
                    <span style="font-weight:600;">${formatVND(item.subtotal)}</span>
                </div>
            `).join('');
        }

        document.getElementById('checkoutTotal').textContent = formatVND(res.total_amount);
    } catch (e) {
        console.error(e);
    }
}

// ================= CUSTOMER ORDERS =================

let allCustomerOrders = [];
let currentOrderFilter = 'all';

async function loadCustomerOrders() {
    const container = document.getElementById('customerOrdersList');
    if (!container) return;

    try {
        const res = await fetchAPI('/api/orders');
        allCustomerOrders = res.orders || [];

        renderFilteredCustomerOrders();
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444; padding:2rem; text-align:center;">Lỗi tải lịch sử đơn hàng: ${e.message}</div>`;
    }
}

function filterCustomerOrders(status, btnElement) {
    currentOrderFilter = status;
    
    // Update button states
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    if (btnElement) {
        btnElement.classList.remove('btn-secondary');
        btnElement.classList.add('btn-primary');
    }

    renderFilteredCustomerOrders();
}

function renderFilteredCustomerOrders() {
    const container = document.getElementById('customerOrdersList');
    if (!container) return;

    let ordersToDisplay = allCustomerOrders;
    if (currentOrderFilter !== 'all') {
        ordersToDisplay = allCustomerOrders.filter(o => o.order_status === currentOrderFilter);
    }

    if (ordersToDisplay.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 3rem; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">
                
                <h3 style="color:#0f172a; margin-bottom:0.5rem;">Không tìm thấy đơn hàng nào ${currentOrderFilter !== 'all' ? 'ở trạng thái này' : ''}</h3>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:1.5rem;">Khám phá các mẫu nhạc cụ tuyệt vời tại Melody Store!</p>
                <a href="/" class="btn btn-primary">Khám phá nhạc cụ ngay</a>
            </div>
        `;
        return;
    }

    const statusLabels = {
        'pending': { label: 'Mới đặt', class: 'badge pending' },
        'processing': { label: 'Đã xử lý', class: 'badge processing' },
        'delivered': { label: 'Đã giao hàng', class: 'badge delivered' },
        'cancelled': { label: 'Đã hủy', class: 'badge cancelled' }
    };

    const paymentLabels = {
        'cod': 'Tiền mặt khi nhận hàng (COD)',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'online': 'Thanh toán trực tuyến'
    };

    container.innerHTML = ordersToDisplay.map(o => {
        const s = statusLabels[o.order_status] || { label: o.order_status, class: 'badge' };

        // Determine step progress
        const isPending = o.order_status === 'pending';
        const isProcessing = o.order_status === 'processing';
        const isDelivered = o.order_status === 'delivered';
        const isCancelled = o.order_status === 'cancelled';

        return `
            <div class="order-card-customer">
                <div class="order-header-row">
                    <div>
                        <span style="font-weight:800; font-size:1.1rem; color:#0f172a;">Đơn hàng: #${o.order_code}</span>
                        <span style="color:#64748b; font-size:0.85rem; margin-left:1rem;">
                            Ngày đặt: ${formatDate(o.created_at)}
                        </span>
                    </div>
                    <div>
                        <span class="${s.class}">${s.label}</span>
                    </div>
                </div>

                <!-- Status Progress Track -->
                ${!isCancelled ? `
                    <div class="order-progress-track">
                        <div class="progress-step ${isPending ? 'current' : 'done'}">
                            <span>●</span> <span>1. Mới đặt hàng</span>
                        </div>
                        <span class="progress-arrow">&rarr;</span>
                        <div class="progress-step ${isProcessing ? 'current' : (isDelivered ? 'done' : '')}">
                            <span>●</span> <span>2. Đã xử lý / Đóng gói</span>
                        </div>
                        <span class="progress-arrow">&rarr;</span>
                        <div class="progress-step ${isDelivered ? 'done' : ''}">
                            <span>●</span> <span>3. Đã giao thành công</span>
                        </div>
                    </div>
                ` : `
                    <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:6px; padding:0.5rem 1rem; color:#991b1b; font-size:0.85rem; margin-bottom:1rem;">
                        Đơn hàng này đã bị hủy.
                    </div>
                `}

                <!-- Items List -->
                <div style="margin: 1rem 0;">
                    ${o.items.map(item => `
                        <div style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; padding: 0.65rem 0; border-bottom: 1px dashed #f1f5f9;">
                            <div style="display:flex; align-items:center; gap: 1rem;">
                                <img src="${item.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'}" 
                                     alt="${item.product_name}" class="order-item-thumb">
                                <div>
                                    <a href="/product/${item.product_id}" style="font-weight: 700; font-size: 0.95rem; color: #0f172a; text-decoration: none;" target="_blank">
                                        ${item.product_name}
                                    </a>
                                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                                        Mã: ${item.code || 'SP'} | Đơn giá: ${formatVND(item.unit_price)}
                                    </div>
                                    <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">
                                        Số lượng: <strong style="color:#d97706;">&times; ${item.quantity}</strong>
                                    </div>
                                </div>
                            </div>
                            <div style="font-weight: 800; color: #b45309; font-size: 1.05rem; white-space: nowrap;">
                                ${formatVND(item.subtotal)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Footer Summary & Actions -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-top:1px solid #f1f5f9; padding-top:1rem; margin-top:0.5rem;">
                    <div style="font-size:0.85rem; color:#475569; line-height:1.6;">
                        <div><strong>Người nhận:</strong> ${o.recipient_name} | SĐT: ${o.recipient_phone}</div>
                        <div><strong>Địa chỉ:</strong> ${o.recipient_address}</div>
                        <div><strong>Thanh toán:</strong> ${paymentLabels[o.payment_method] || o.payment_method} 
                            (${o.payment_status === 'paid' ? '<span style="color:#16a34a; font-weight:700;">Đã thanh toán</span>' : '<span style="color:#b45309; font-weight:700;">Chưa thanh toán</span>'})
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
                        <div>
                            <span style="color:#64748b; font-size:0.85rem;">Tổng thanh toán: </span>
                            <span style="font-size:1.35rem; font-weight:800; color:#b45309;">${formatVND(o.total_amount)}</span>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn btn-sm btn-secondary" onclick="viewCustomerOrderDetail('${o.order_code}')">Chi tiết hóa đơn</button>
                            <button class="btn btn-sm btn-primary" onclick="reorderCustomerItems(${o.id})">Mua lại đơn này</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function viewCustomerOrderDetail(orderCode) {
    try {
        const res = await fetchAPI(`/api/orders/${orderCode}`);
        const o = res.order;

        document.getElementById('custModalOrderCode').textContent = o.order_code;

        const paymentLabels = {
            'cod': 'Tiền mặt khi nhận hàng (COD)',
            'bank_transfer': 'Chuyển khoản ngân hàng',
            'online': 'Thanh toán trực tuyến'
        };

        const statusLabels = {
            'pending': 'Mới đặt',
            'processing': 'Đã xử lý',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };

        document.getElementById('custModalOrderBody').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:#f8fafc; padding:1rem; border-radius:8px; margin-bottom:1rem; font-size:0.88rem;">
                <div>
                    <div><strong>Mã đơn hàng:</strong> #${o.order_code}</div>
                    <div><strong>Ngày đặt:</strong> ${formatDate(o.created_at)}</div>
                    <div><strong>Tình trạng:</strong> <span style="font-weight:700; color:#d97706;">${statusLabels[o.order_status] || o.order_status}</span></div>
                </div>
                <div>
                    <div><strong>Người nhận:</strong> ${o.recipient_name} (${o.recipient_phone})</div>
                    <div><strong>Địa chỉ:</strong> ${o.recipient_address}</div>
                    <div><strong>Hình thức:</strong> ${paymentLabels[o.payment_method] || o.payment_method}</div>
                </div>
            </div>

            <h4 style="font-size:0.95rem; font-weight:700; color:#0f172a; margin-bottom:0.5rem;">Danh sách sản phẩm:</h4>
            <table style="width:100%; border-collapse:collapse; font-size:0.88rem; margin-bottom:1rem;">
                <thead>
                    <tr style="border-bottom:2px solid #e2e8f0; text-align:left;">
                        <th style="padding:0.5rem 0;">Sản phẩm</th>
                        <th style="padding:0.5rem; text-align:center;">Đơn giá</th>
                        <th style="padding:0.5rem; text-align:center;">Số lượng</th>
                        <th style="padding:0.5rem 0; text-align:right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${o.items.map(it => `
                        <tr style="border-bottom:1px solid #f1f5f9;">
                            <td style="padding:0.6rem 0; font-weight:600;">${it.product_name}</td>
                            <td style="padding:0.6rem; text-align:center;">${formatVND(it.unit_price)}</td>
                            <td style="padding:0.6rem; text-align:center;">${it.quantity}</td>
                            <td style="padding:0.6rem 0; text-align:right; font-weight:700; color:#b45309;">${formatVND(it.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="text-align:right; font-size:1.25rem; font-weight:800; color:#b45309; border-top:1px solid #e2e8f0; padding-top:0.75rem;">
                Tổng tiền thanh toán: ${formatVND(o.total_amount)}
            </div>
        `;

        const modal = document.getElementById('customerOrderDetailModal');
        if (modal) modal.style.display = 'flex';

    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function reorderCustomerItems(orderId) {
    const order = allCustomerOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
        let addedCount = 0;
        for (const it of order.items) {
            try {
                await fetchAPI('/api/cart/add', {
                    method: 'POST',
                    body: JSON.stringify({ product_id: it.product_id, quantity: it.quantity })
                });
                addedCount++;
            } catch (err) {
                console.warn(err);
            }
        }
        showToast(`Đã thêm ${addedCount} sản phẩm từ đơn hàng vào giỏ!`, 'success');
        setTimeout(() => {
            window.location.href = '/cart';
        }, 800);
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ================= CUSTOMER PROFILE =================

async function loadCustomerProfile() {
    try {
        const res = await fetchAPI('/api/auth/profile');
        const user = res.user;
        document.getElementById('profUsername').value = user.username;
        document.getElementById('profFullName').value = user.full_name || '';
        document.getElementById('profEmail').value = user.email || '';
        document.getElementById('profPhone').value = user.phone || '';
        document.getElementById('profAddress').value = user.address || '';
    } catch (e) {
        console.error(e);
    }

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById('profFullName').value.trim(),
            email: document.getElementById('profEmail').value.trim(),
            phone: document.getElementById('profPhone').value.trim(),
            address: document.getElementById('profAddress').value.trim(),
            old_password: document.getElementById('profOldPass').value.trim(),
            new_password: document.getElementById('profNewPass').value.trim()
        };

        try {
            const res = await fetchAPI('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast(res.message, 'success');
            document.getElementById('profOldPass').value = '';
            document.getElementById('profNewPass').value = '';
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}
