/**
 * Admin Dashboard Page Module (SPA)
 */

export const AdminDashboardModule = {
    container: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        document.title = 'Bảng Điều Khiển Quản Trị - Melody Store';

        // Set Topbar title
        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Tổng Quan Tình Hình Kinh Doanh';

        this.renderShell();
        await this.loadStats();
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Doanh Thu Đơn Hàng</h3>
                        <div class="stat-number" id="statRevenue" style="color: #b45309;">0 ₫</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Tổng Đơn Đặt Hàng</h3>
                        <div class="stat-number" id="statOrders">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Đơn Chờ Xử Lý</h3>
                        <div class="stat-number" id="statPendingOrders" style="color: #d97706;">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Sản Phẩm Đang Bán</h3>
                        <div class="stat-number" id="statProducts">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Tổng Khách Hàng</h3>
                        <div class="stat-number" id="statCustomers">0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Cảnh Báo Hết Hàng (&le;5)</h3>
                        <div class="stat-number" id="statLowStock" style="color: #dc2626;">0</div>
                    </div>
                </div>
            </div>

            <!-- Quick Links & Recent Orders -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <!-- Recent Orders Table -->
                <div class="table-card" style="padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">Đơn hàng mới nhất</h3>
                        <a href="/admin/orders" class="btn btn-sm btn-primary">Xem tất cả đơn &rarr;</a>
                    </div>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="recentOrdersBody">
                            <tr><td colspan="6" style="text-align:center; padding:2rem; color:#64748b;">Đang tải đơn hàng mới...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Quick Management Hub -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; color: #0f172a;">Truy Cập Nhanh Quản Trị</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <a href="/admin/imports" class="btn btn-secondary" style="justify-content: flex-start;">Thêm phiếu nhập hàng mới</a>
                            <a href="/admin/products" class="btn btn-secondary" style="justify-content: flex-start;">Quản lý & thêm sản phẩm</a>
                            <a href="/admin/pricing" class="btn btn-secondary" style="justify-content: flex-start;">Điều chỉnh % lợi nhuận & giá bán</a>
                            <a href="/admin/inventory" class="btn btn-secondary" style="justify-content: flex-start;">Xem báo cáo Nhập - Xuất - Tồn</a>
                        </div>
                    </div>

                    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 1.25rem;">
                        <div style="font-weight: 700; color: #92400e; margin-bottom: 0.4rem;">Ghi chú quản lý:</div>
                        <p style="font-size: 0.85rem; color: #78350f; line-height: 1.5;">
                            Phiếu nhập hàng ở trạng thái <strong>Bản nháp</strong> có thể tự do chỉnh sửa và xóa. Khi bấm <strong>Hoàn thành</strong>, hệ thống tự động cộng dồn kho hàng và chốt giá vốn.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    async loadStats() {
        try {
            const res = await fetchAPI('/api/admin/dashboard-stats');
            const s = res.stats;

            const revEl = document.getElementById('statRevenue');
            if (revEl) revEl.textContent = formatVND(s.total_revenue);

            const ordEl = document.getElementById('statOrders');
            if (ordEl) ordEl.textContent = s.total_orders;

            const pendEl = document.getElementById('statPendingOrders');
            if (pendEl) pendEl.textContent = s.pending_orders;

            const prodEl = document.getElementById('statProducts');
            if (prodEl) prodEl.textContent = s.total_products;

            const custEl = document.getElementById('statCustomers');
            if (custEl) custEl.textContent = s.total_customers;

            const lowEl = document.getElementById('statLowStock');
            if (lowEl) lowEl.textContent = s.low_stock_products;

            const tableBody = document.getElementById('recentOrdersBody');
            if (tableBody) {
                const statusLabels = {
                    'pending': '<span class="badge pending">Mới đặt</span>',
                    'processing': '<span class="badge processing">Đã xử lý</span>',
                    'delivered': '<span class="badge delivered">Đã giao</span>',
                    'cancelled': '<span class="badge cancelled">Hủy</span>'
                };

                if (!res.recent_orders || res.recent_orders.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#64748b;">Chưa có đơn hàng nào</td></tr>';
                    return;
                }

                tableBody.innerHTML = res.recent_orders.map(o => `
                    <tr>
                        <td><strong>#${o.order_code}</strong></td>
                        <td>${o.recipient_name}</td>
                        <td>${formatDate(o.created_at)}</td>
                        <td style="font-weight:700; color:#b45309;">${formatVND(o.total_amount)}</td>
                        <td>${statusLabels[o.order_status] || o.order_status}</td>
                        <td><a href="/admin/orders?search=${o.order_code}" class="btn btn-sm btn-secondary">Xem</a></td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
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
