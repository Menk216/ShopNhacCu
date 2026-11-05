/**
 * Admin Orders Management Page Module (SPA)
 */

export const AdminOrdersModule = {
    container: null,
    listeners: [],
    adminOrdersList: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.adminOrdersList = [];
        document.title = 'Quản Lý Đơn Đặt Hàng - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Đơn Đặt Hàng Của Khách Hàng';

        this.renderShell();
        this.bindEvents();

        // Check if search query was passed via URL (e.g., from Dashboard)
        const initialSearch = query.get('search');
        if (initialSearch) {
            const searchInput = document.getElementById('filterOrderSearch');
            if (searchInput) searchInput.value = initialSearch;
        }

        await this.loadOrders();
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Search & Filter Bar by Date range & Status -->
            <div class="toolbar-card">
                <div class="filter-group">
                    <div class="form-group">
                        <label for="filterOrderStatus">Tình trạng đơn hàng</label>
                        <select id="filterOrderStatus" class="form-control">
                            <option value="">-- Tất cả trạng thái --</option>
                            <option value="pending">Mới đặt</option>
                            <option value="processing">Đã xử lý</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Hủy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterOrderFromDate">Từ ngày đặt</label>
                        <input type="date" id="filterOrderFromDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="filterOrderToDate">Đến ngày đặt</label>
                        <input type="date" id="filterOrderToDate" class="form-control">
                    </div>
                    <div class="form-group" style="min-width: 220px;">
                        <label for="filterOrderSearch">Tìm mã ĐH / Tên khách</label>
                        <input type="text" id="filterOrderSearch" class="form-control" placeholder="DH-..., tên người nhận...">
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary" id="btnRefreshOrders">Làm mới</button>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="table-card">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Người nhận</th>
                            <th>Số lượng món</th>
                            <th>Tổng thanh toán</th>
                            <th>Tình trạng</th>
                            <th>Thanh toán</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody">
                        <tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Đang tải danh sách đơn hàng...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Order Detail & Status Update Modal -->
            <div id="orderDetailModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 720px;">
                    <div class="admin-modal-header">
                        <h3 style="font-size: 1.15rem; font-weight: 700;">Chi Tiết Đơn Hàng #<span id="modalOrderCodeDisplay"></span></h3>
                        <button class="modal-close" id="btnCloseOrderModal">&times;</button>
                    </div>

                    <div id="orderDetailContent"></div>

                    <!-- Status update form -->
                    <form id="updateOrderStatusForm" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-top: 1.25rem;">
                        <input type="hidden" id="modalOrderId">
                        <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">Cập Nhật Trạng Thái Đơn Hàng:</h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label for="modalOrderStatusSelect">Tình trạng đơn hàng (*)</label>
                                <select id="modalOrderStatusSelect" class="form-control" required>
                                    <option value="pending">Mới đặt</option>
                                    <option value="processing">Đã xử lý</option>
                                    <option value="delivered">Đã giao (Trừ tồn kho)</option>
                                    <option value="cancelled">Hủy (Tự động hoàn tồn kho nếu đã giao)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="modalPaymentStatusSelect">Tình trạng thanh toán</label>
                                <select id="modalPaymentStatusSelect" class="form-control">
                                    <option value="unpaid">Chưa thanh toán</option>
                                    <option value="paid">Đã thanh toán</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                            <button type="button" class="btn btn-secondary" id="btnCancelOrderModal">Đóng</button>
                            <button type="submit" class="btn btn-primary">Lưu Trạng Thái Đơn</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const statusSelect = document.getElementById('filterOrderStatus');
        const fromDate = document.getElementById('filterOrderFromDate');
        const toDate = document.getElementById('filterOrderToDate');
        const searchInput = document.getElementById('filterOrderSearch');
        const refreshBtn = document.getElementById('btnRefreshOrders');

        const onFilterChange = () => this.loadOrders();

        [statusSelect, fromDate, toDate].forEach(el => {
            if (el) {
                el.addEventListener('change', onFilterChange);
                this.listeners.push({ el, type: 'change', fn: onFilterChange });
            }
        });

        if (searchInput) {
            let timeout = null;
            const onSearch = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.loadOrders(), 300);
            };
            searchInput.addEventListener('input', onSearch);
            this.listeners.push({ el: searchInput, type: 'input', fn: onSearch });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', onFilterChange);
            this.listeners.push({ el: refreshBtn, type: 'click', fn: onFilterChange });
        }

        // Modal Handlers
        const modal = document.getElementById('orderDetailModal');
        const closeBtn = document.getElementById('btnCloseOrderModal');
        const cancelBtn = document.getElementById('btnCancelOrderModal');
        const updateForm = document.getElementById('updateOrderStatusForm');

        const closeModal = () => { if (modal) modal.style.display = 'none'; };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: closeBtn, type: 'click', fn: closeModal });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: cancelBtn, type: 'click', fn: closeModal });
        }

        if (updateForm) {
            const onSubmit = async (e) => {
                e.preventDefault();
                const orderId = document.getElementById('modalOrderId').value;
                const newStatus = document.getElementById('modalOrderStatusSelect').value;
                const newPayment = document.getElementById('modalPaymentStatusSelect').value;

                try {
                    const res = await fetchAPI(`/api/admin/orders/${orderId}/status`, {
                        method: 'PUT',
                        body: JSON.stringify({ order_status: newStatus, payment_status: newPayment })
                    });
                    showToast(res.message, 'success');
                    closeModal();
                    await this.loadOrders();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            updateForm.addEventListener('submit', onSubmit);
            this.listeners.push({ el: updateForm, type: 'submit', fn: onSubmit });
        }

        // Table actions delegation
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            const onTableClick = async (e) => {
                const detailBtn = e.target.closest('.btn-detail-order[data-id]');
                if (detailBtn) {
                    const id = parseInt(detailBtn.getAttribute('data-id'));
                    await this.openOrderDetail(id);
                    return;
                }
            };
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        const fromDate = document.getElementById('filterOrderFromDate')?.value || '';
        const toDate = document.getElementById('filterOrderToDate')?.value || '';
        const status = document.getElementById('filterOrderStatus')?.value || '';
        const search = document.getElementById('filterOrderSearch')?.value.trim() || '';

        let url = `/api/admin/orders?from_date=${fromDate}&to_date=${toDate}&status=${status}&search=${encodeURIComponent(search)}`;

        try {
            const res = await fetchAPI(url);
            this.adminOrdersList = res.orders || [];

            if (this.adminOrdersList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy đơn hàng nào phù hợp điều kiện lọc</td></tr>';
                return;
            }

            const statusLabels = {
                'pending': { label: 'Mới đặt', class: 'badge pending' },
                'processing': { label: 'Đã xử lý', class: 'badge processing' },
                'delivered': { label: 'Đã giao', class: 'badge delivered' },
                'cancelled': { label: 'Hủy', class: 'badge cancelled' }
            };

            tbody.innerHTML = this.adminOrdersList.map(o => {
                const s = statusLabels[o.order_status] || { label: o.order_status, class: 'badge' };
                return `
                    <tr>
                        <td><strong>#${this.escapeHtml(o.order_code)}</strong></td>
                        <td>${formatDate(o.created_at)}</td>
                        <td>
                            <div style="font-weight:600;">${this.escapeHtml(o.recipient_name)}</div>
                            <div style="font-size:0.75rem; color:#64748b;">${this.escapeHtml(o.recipient_phone)}</div>
                        </td>
                        <td>${o.total_items_type} loại (${o.total_items_qty} món)</td>
                        <td style="font-weight:700; color:#b45309;">${formatVND(o.total_amount)}</td>
                        <td><span class="${s.class}">${s.label}</span></td>
                        <td>
                            <span class="badge ${o.payment_status === 'paid' ? 'paid' : 'unpaid'}">
                                ${o.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-secondary btn-detail-order" data-id="${o.id}">Chi tiết & Cập nhật</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    async openOrderDetail(orderId) {
        try {
            const res = await fetchAPI(`/api/admin/orders/${orderId}`);
            const o = res.order;

            document.getElementById('modalOrderCodeDisplay').textContent = o.order_code;
            document.getElementById('modalOrderId').value = o.id;
            document.getElementById('modalOrderStatusSelect').value = o.order_status;
            document.getElementById('modalPaymentStatusSelect').value = o.payment_status;

            const infoHtml = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; font-size:0.9rem;">
                    <div>
                        <div><strong>Tài khoản đặt:</strong> ${this.escapeHtml(o.customer_account_name || o.username)}</div>
                        <div><strong>Người nhận:</strong> ${this.escapeHtml(o.recipient_name)}</div>
                        <div><strong>SĐT liên hệ:</strong> ${this.escapeHtml(o.recipient_phone)}</div>
                        <div><strong>Địa chỉ giao:</strong> ${this.escapeHtml(o.recipient_address)}</div>
                    </div>
                    <div>
                        <div><strong>Ngày đặt hàng:</strong> ${formatDate(o.created_at)}</div>
                        <div><strong>Hình thức thanh toán:</strong> ${this.escapeHtml(o.payment_method.toUpperCase())}</div>
                        <div><strong>Ghi chú:</strong> ${this.escapeHtml(o.notes || 'Không có')}</div>
                    </div>
                </div>
                <table class="admin-table" style="margin-top:0.75rem;">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${o.items.map(it => `
                            <tr>
                                <td>${this.escapeHtml(it.product_name)}</td>
                                <td>${formatVND(it.unit_price)}</td>
                                <td>${it.quantity}</td>
                                <td style="font-weight:700; color:#b45309;">${formatVND(it.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="text-align:right; margin-top:1rem; font-size:1.2rem; font-weight:700; color:#b45309;">
                    Tổng đơn hàng: ${formatVND(o.total_amount)}
                </div>
            `;

            document.getElementById('orderDetailContent').innerHTML = infoHtml;
            const modal = document.getElementById('orderDetailModal');
            if (modal) modal.style.display = 'flex';
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
