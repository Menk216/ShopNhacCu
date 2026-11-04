/**
 * Customer Orders History Page Module (SPA)
 */

export const OrdersModule = {
    container: null,
    listeners: [],
    allOrders: [],
    currentFilter: 'all',

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.allOrders = [];
        this.currentFilter = 'all';
        document.title = 'Lịch Sử Mua Hàng - Melody Store';

        this.renderShell();
        this.bindEvents();
        await this.loadOrders();
    },

    renderShell() {
        this.container.innerHTML = `
            <div style="max-width: 950px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
                            Lịch Sử Mua Hàng Của Bạn
                        </h1>
                        <p style="color: #64748b; font-size: 0.9rem;">Theo dõi chi tiết các đơn hàng, tình trạng giao hàng và lịch sử mua sắm nhạc cụ</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button type="button" class="btn btn-secondary" id="btnOpenQuickOrders">Xem nhanh</button>
                        <a href="/" class="btn btn-primary">Tiếp tục mua sắm</a>
                    </div>
                </div>

                <!-- Status filter chips -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem;" id="orderFilterTabs">
                    <button class="btn btn-sm btn-primary order-filter-btn" data-status="all">Tất cả đơn</button>
                    <button class="btn btn-sm btn-secondary order-filter-btn" data-status="pending">Mới đặt</button>
                    <button class="btn btn-sm btn-secondary order-filter-btn" data-status="processing">Đã xử lý</button>
                    <button class="btn btn-sm btn-secondary order-filter-btn" data-status="delivered">Đã giao</button>
                    <button class="btn btn-sm btn-secondary order-filter-btn" data-status="cancelled">Đã hủy</button>
                </div>

                <!-- Orders list container -->
                <div id="customerOrdersList">
                    <div style="text-align: center; padding: 3rem; color: #64748b;">Đang tải danh sách đơn hàng...</div>
                </div>
            </div>

            <!-- Modal Chi Tiết Hóa Đơn Khách Hàng -->
            <div id="customerOrderDetailModal" class="modal-overlay" style="display: none;">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: #0f172a;">Hóa Đơn Chi Tiết: #<span id="custModalOrderCode"></span></h3>
                        <button class="modal-close" id="btnCloseOrderModal">&times;</button>
                    </div>
                    <div id="custModalOrderBody"></div>
                    <div style="text-align: right; margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
                        <button type="button" class="btn btn-secondary" id="btnDismissOrderModal">Đóng</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const filterTabs = document.getElementById('orderFilterTabs');
        if (filterTabs) {
            const onFilterClick = (e) => {
                const btn = e.target.closest('.order-filter-btn');
                if (btn) {
                    this.currentFilter = btn.getAttribute('data-status');
                    filterTabs.querySelectorAll('.order-filter-btn').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-secondary');
                    });
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-primary');
                    this.renderFilteredOrders();
                }
            };
            filterTabs.addEventListener('click', onFilterClick);
            this.listeners.push({ el: filterTabs, type: 'click', fn: onFilterClick });
        }

        const quickBtn = document.getElementById('btnOpenQuickOrders');
        if (quickBtn && window.openQuickOrdersModal) {
            const onQuick = () => window.openQuickOrdersModal();
            quickBtn.addEventListener('click', onQuick);
            this.listeners.push({ el: quickBtn, type: 'click', fn: onQuick });
        }

        const closeBtn = document.getElementById('btnCloseOrderModal');
        const dismissBtn = document.getElementById('btnDismissOrderModal');
        const modal = document.getElementById('customerOrderDetailModal');
        const closeModal = () => { if (modal) modal.style.display = 'none'; };
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: closeBtn, type: 'click', fn: closeModal });
        }
        if (dismissBtn) {
            dismissBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: dismissBtn, type: 'click', fn: closeModal });
        }

        // Event delegation on customerOrdersList
        const listContainer = document.getElementById('customerOrdersList');
        if (listContainer) {
            const onListClick = async (e) => {
                const viewBtn = e.target.closest('.btn-view-order[data-code]');
                if (viewBtn) {
                    const code = viewBtn.getAttribute('data-code');
                    await this.viewOrderDetail(code);
                    return;
                }

                const reorderBtn = e.target.closest('.btn-reorder[data-id]');
                if (reorderBtn) {
                    const id = parseInt(reorderBtn.getAttribute('data-id'));
                    await this.reorderItems(id);
                    return;
                }
            };
            listContainer.addEventListener('click', onListClick);
            this.listeners.push({ el: listContainer, type: 'click', fn: onListClick });
        }
    },

    async loadOrders() {
        const container = document.getElementById('customerOrdersList');
        if (!container) return;

        try {
            const res = await fetchAPI('/api/orders');
            this.allOrders = res.orders || [];
            this.renderFilteredOrders();
        } catch (e) {
            container.innerHTML = `<div style="color:#ef4444; padding:2rem; text-align:center;">Lỗi tải lịch sử đơn hàng: ${e.message}</div>`;
        }
    },

    renderFilteredOrders() {
        const container = document.getElementById('customerOrdersList');
        if (!container) return;

        let list = this.allOrders;
        if (this.currentFilter !== 'all') {
            list = this.allOrders.filter(o => o.order_status === this.currentFilter);
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 3rem; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">
                    <h3 style="color:#0f172a; margin-bottom:0.5rem;">Không tìm thấy đơn hàng nào ${this.currentFilter !== 'all' ? 'ở trạng thái này' : ''}</h3>
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

        container.innerHTML = list.map(o => {
            const s = statusLabels[o.order_status] || { label: o.order_status, class: 'badge' };
            const isPending = o.order_status === 'pending';
            const isProcessing = o.order_status === 'processing';
            const isDelivered = o.order_status === 'delivered';
            const isCancelled = o.order_status === 'cancelled';

            return `
                <div class="order-card-customer">
                    <div class="order-header-row">
                        <div>
                            <span style="font-weight:800; font-size:1.1rem; color:#0f172a;">Đơn hàng: #${this.escapeHtml(o.order_code)}</span>
                            <span style="color:#64748b; font-size:0.85rem; margin-left:1rem;">
                                Ngày đặt: ${formatDate(o.created_at)}
                            </span>
                        </div>
                        <div>
                            <span class="${s.class}">${s.label}</span>
                        </div>
                    </div>

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
                                         alt="${this.escapeHtml(item.product_name)}" class="order-item-thumb">
                                    <div>
                                        <a href="/product/${item.product_id}" style="font-weight: 700; font-size: 0.95rem; color: #0f172a; text-decoration: none;">
                                            ${this.escapeHtml(item.product_name)}
                                        </a>
                                        <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                                            Mã: ${this.escapeHtml(item.code || 'SP')} | Đơn giá: ${formatVND(item.unit_price)}
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
                            <div><strong>Người nhận:</strong> ${this.escapeHtml(o.recipient_name)} | SĐT: ${this.escapeHtml(o.recipient_phone)}</div>
                            <div><strong>Địa chỉ:</strong> ${this.escapeHtml(o.recipient_address)}</div>
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
                                <button class="btn btn-sm btn-secondary btn-view-order" data-code="${o.order_code}">Chi tiết hóa đơn</button>
                                <button class="btn btn-sm btn-primary btn-reorder" data-id="${o.id}">Mua lại đơn này</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async viewOrderDetail(orderCode) {
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
                        <div><strong>Mã đơn hàng:</strong> #${this.escapeHtml(o.order_code)}</div>
                        <div><strong>Ngày đặt:</strong> ${formatDate(o.created_at)}</div>
                        <div><strong>Tình trạng:</strong> <span style="font-weight:700; color:#d97706;">${statusLabels[o.order_status] || o.order_status}</span></div>
                    </div>
                    <div>
                        <div><strong>Người nhận:</strong> ${this.escapeHtml(o.recipient_name)} (${this.escapeHtml(o.recipient_phone)})</div>
                        <div><strong>Địa chỉ:</strong> ${this.escapeHtml(o.recipient_address)}</div>
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
                                <td style="padding:0.6rem 0; font-weight:600;">${this.escapeHtml(it.product_name)}</td>
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
    },

    async reorderItems(orderId) {
        const order = this.allOrders.find(o => o.id === orderId);
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
            if (window.appRouter) {
                window.appRouter.navigate('/cart');
            } else {
                window.location.href = '/cart';
            }
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    },

    destroy() {
        this.listeners.forEach(({ el, type, fn }) => {
            if (el && el.removeEventListener) {
                el.removeEventListener(type, fn);
            }
        });
        this.listeners = [];
        this.container = null;
    }
};
