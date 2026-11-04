/**
 * Admin Inventory & Nhập - Xuất - Tồn Report Page Module (SPA)
 */

export const AdminInventoryModule = {
    container: null,
    listeners: [],
    categoriesList: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.categoriesList = [];
        document.title = 'Quản Lý Tồn Kho & Báo Cáo Nhập Xuất Tồn - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Tồn Kho & Báo Cáo Nhập - Xuất - Tồn';

        this.renderShell();
        this.bindEvents();
        await this.loadCategoriesDropdown();
        await this.loadCurrentStock();
    },

    renderShell() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const firstDayOfMonth = `${year}-${month}-01`;
        const today = `${year}-${month}-${day}`;

        this.container.innerHTML = `
            <!-- Tab buttons -->
            <div style="display: flex; border-bottom: 2px solid #e2e8f0; margin-bottom: 1.5rem; gap: 1rem;">
                <button id="tabStockBtn" type="button" class="btn" style="border-radius: 8px 8px 0 0; background: #fff; border: 1px solid #e2e8f0; border-bottom: none; font-weight: 700; color: #d97706;">
                    Tra Cứu Tồn Kho Hiện Tại & Cảnh Báo
                </button>
                <button id="tabReportBtn" type="button" class="btn" style="border-radius: 8px 8px 0 0; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #64748b;">
                    Báo Cáo Nhập – Xuất – Tồn Theo Khoảng Thời Gian
                </button>
            </div>

            <!-- ================= TAB 1: CURRENT STOCK & LOW STOCK ALERT ================= -->
            <div id="tabCurrentStockSection">
                <div class="toolbar-card">
                    <div class="filter-group">
                        <div class="form-group">
                            <label for="invCatSelect">Lọc theo loại sản phẩm</label>
                            <select id="invCatSelect" class="form-control">
                                <option value="">-- Tất cả loại sản phẩm --</option>
                            </select>
                        </div>
                        <div class="form-group" style="padding-bottom: 0.25rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.88rem; color: #dc2626;">
                                <input type="checkbox" id="invLowStockCheck">
                                <span>Chỉ xem sản phẩm sắp hết hàng (&le; 5 chiếc)</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn btn-secondary" id="btnRefreshStock">Làm mới danh sách</button>
                    </div>
                </div>

                <div class="table-card">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Loại sản phẩm</th>
                                <th>Giá vốn</th>
                                <th>Số lượng tồn</th>
                                <th>Tình trạng tồn kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="currentStockTableBody">
                            <tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Đang tải tồn kho...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ================= TAB 2: IMPORT - EXPORT - INVENTORY REPORT ================= -->
            <div id="tabReportSection" style="display: none;">
                <div class="toolbar-card">
                    <div class="filter-group">
                        <div class="form-group">
                            <label for="reportFromDate">Từ ngày (*)</label>
                            <input type="date" id="reportFromDate" class="form-control" value="${firstDayOfMonth}">
                        </div>
                        <div class="form-group">
                            <label for="reportToDate">Đến ngày (*)</label>
                            <input type="date" id="reportToDate" class="form-control" value="${today}">
                        </div>
                        <div class="form-group">
                            <label for="reportCatSelect">Loại sản phẩm</label>
                            <select id="reportCatSelect" class="form-control">
                                <option value="">-- Tất cả loại --</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn btn-primary" id="btnGenerateReport">Xuất Báo Cáo</button>
                    </div>
                </div>

                <!-- Summary Card for Report -->
                <div id="reportSummaryCard" class="stats-grid" style="display: none; margin-bottom: 1.5rem;">
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3>Tổng Tồn Đầu Kỳ</h3>
                            <div class="stat-number" id="reportTotalOpening">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3>Tổng Nhập Trong Kỳ</h3>
                            <div class="stat-number" id="reportTotalImport" style="color: #16a34a;">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3>Tổng Xuất (Đã Bán)</h3>
                            <div class="stat-number" id="reportTotalExport" style="color: #dc2626;">0</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <h3>Tổng Tồn Cuối Kỳ</h3>
                            <div class="stat-number" id="reportTotalClosing" style="color: #b45309;">0</div>
                        </div>
                    </div>
                </div>

                <div class="table-card">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Loại</th>
                                <th style="text-align:center;">Tồn đầu kỳ</th>
                                <th style="text-align:center;">Nhập trong kỳ</th>
                                <th style="text-align:center;">Xuất trong kỳ</th>
                                <th style="text-align:center;">Tồn cuối kỳ</th>
                                <th style="text-align:center;">Tồn thực tế hiện tại</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryReportTableBody">
                            <tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Chọn khoảng thời gian và bấm "Xuất Báo Cáo" để tổng hợp</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const tabStockBtn = document.getElementById('tabStockBtn');
        const tabReportBtn = document.getElementById('tabReportBtn');
        const tabStockSec = document.getElementById('tabCurrentStockSection');
        const tabReportSec = document.getElementById('tabReportSection');

        const switchTab = (tab) => {
            if (tab === 'stock') {
                tabStockSec.style.display = 'block';
                tabReportSec.style.display = 'none';
                tabStockBtn.style.background = '#fff';
                tabStockBtn.style.color = '#d97706';
                tabStockBtn.style.fontWeight = '700';
                tabStockBtn.style.borderBottom = 'none';
                tabReportBtn.style.background = '#f8fafc';
                tabReportBtn.style.color = '#64748b';
                tabReportBtn.style.fontWeight = '600';
                tabReportBtn.style.borderBottom = '1px solid #e2e8f0';
            } else {
                tabStockSec.style.display = 'none';
                tabReportSec.style.display = 'block';
                tabReportBtn.style.background = '#fff';
                tabReportBtn.style.color = '#d97706';
                tabReportBtn.style.fontWeight = '700';
                tabReportBtn.style.borderBottom = 'none';
                tabStockBtn.style.background = '#f8fafc';
                tabStockBtn.style.color = '#64748b';
                tabStockBtn.style.fontWeight = '600';
                tabStockBtn.style.borderBottom = '1px solid #e2e8f0';
            }
        };

        if (tabStockBtn) {
            const onStockTab = () => switchTab('stock');
            tabStockBtn.addEventListener('click', onStockTab);
            this.listeners.push({ el: tabStockBtn, type: 'click', fn: onStockTab });
        }
        if (tabReportBtn) {
            const onReportTab = () => switchTab('report');
            tabReportBtn.addEventListener('click', onReportTab);
            this.listeners.push({ el: tabReportBtn, type: 'click', fn: onReportTab });
        }

        const invCat = document.getElementById('invCatSelect');
        const invLowStock = document.getElementById('invLowStockCheck');
        const refreshStockBtn = document.getElementById('btnRefreshStock');

        const onStockFilter = () => this.loadCurrentStock();

        if (invCat) {
            invCat.addEventListener('change', onStockFilter);
            this.listeners.push({ el: invCat, type: 'change', fn: onStockFilter });
        }
        if (invLowStock) {
            invLowStock.addEventListener('change', onStockFilter);
            this.listeners.push({ el: invLowStock, type: 'change', fn: onStockFilter });
        }
        if (refreshStockBtn) {
            refreshStockBtn.addEventListener('click', onStockFilter);
            this.listeners.push({ el: refreshStockBtn, type: 'click', fn: onStockFilter });
        }

        const reportBtn = document.getElementById('btnGenerateReport');
        if (reportBtn) {
            const onGenReport = () => this.generateInventoryReport();
            reportBtn.addEventListener('click', onGenReport);
            this.listeners.push({ el: reportBtn, type: 'click', fn: onGenReport });
        }
    },

    async loadCategoriesDropdown() {
        try {
            const res = await fetchAPI('/api/admin/categories');
            this.categoriesList = res.categories || [];
            const options = this.categoriesList.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('');

            const invCat = document.getElementById('invCatSelect');
            if (invCat) invCat.innerHTML = '<option value="">-- Tất cả loại sản phẩm --</option>' + options;

            const repCat = document.getElementById('reportCatSelect');
            if (repCat) repCat.innerHTML = '<option value="">-- Tất cả loại --</option>' + options;
        } catch (e) {
            console.error(e);
        }
    },

    async loadCurrentStock() {
        const tbody = document.getElementById('currentStockTableBody');
        if (!tbody) return;

        const catId = document.getElementById('invCatSelect')?.value || '';
        const lowStockOnly = document.getElementById('invLowStockCheck')?.checked || false;

        let url = `/api/admin/inventory/current?low_stock_only=${lowStockOnly}`;
        if (catId) url += `&category_id=${catId}`;

        try {
            const res = await fetchAPI(url);
            const list = res.inventory || [];

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Không có dữ liệu tồn kho</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(item => `
                <tr ${item.is_low_stock ? 'style="background-color: #fffbeb;"' : ''}>
                    <td><strong>${this.escapeHtml(item.code)}</strong></td>
                    <td>
                        <div style="font-weight:600;">${this.escapeHtml(item.name)}</div>
                    </td>
                    <td>${this.escapeHtml(item.category_name)}</td>
                    <td>${formatVND(item.cost_price)}</td>
                    <td style="font-size:1.1rem; font-weight:800; color: ${item.stock_quantity <= 5 ? '#dc2626' : '#1e293b'};">
                        ${item.stock_quantity}
                    </td>
                    <td>
                        <span class="badge ${item.stock_quantity === 0 ? 'danger' : (item.is_low_stock ? 'warning' : 'active')}">
                            ${item.stock_status}
                        </span>
                    </td>
                    <td>
                        <a href="/admin/imports?product_id=${item.id}" class="btn btn-sm btn-primary" title="Tạo phiếu nhập hàng cho sản phẩm này">Nhập hàng</a>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    async generateInventoryReport() {
        const tbody = document.getElementById('inventoryReportTableBody');
        if (!tbody) return;

        const fromDate = document.getElementById('reportFromDate')?.value || '';
        const toDate = document.getElementById('reportToDate')?.value || '';
        const catId = document.getElementById('reportCatSelect')?.value || '';

        let url = `/api/admin/inventory/report?from_date=${fromDate}&to_date=${toDate}`;
        if (catId) url += `&category_id=${catId}`;

        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Đang tính toán số liệu Nhập - Xuất - Tồn...</td></tr>';

        try {
            const res = await fetchAPI(url);
            const list = res.report || [];
            const summary = res.summary || {};

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Không có dữ liệu trong khoảng thời gian đã chọn</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(item => `
                <tr>
                    <td><strong>${this.escapeHtml(item.product_code)}</strong></td>
                    <td>${this.escapeHtml(item.product_name)}</td>
                    <td>${this.escapeHtml(item.category_name)}</td>
                    <td style="font-weight:600; text-align:center;">${item.opening_stock}</td>
                    <td style="font-weight:700; color:#16a34a; text-align:center;">+${item.import_qty}</td>
                    <td style="font-weight:700; color:#dc2626; text-align:center;">-${item.export_qty}</td>
                    <td style="font-weight:800; color:#b45309; text-align:center; font-size:1.05rem;">${item.closing_stock}</td>
                    <td style="text-align:center; color:#64748b;">${item.current_actual_stock}</td>
                </tr>
            `).join('');

            // Summary row
            document.getElementById('reportTotalOpening').textContent = summary.total_opening || 0;
            document.getElementById('reportTotalImport').textContent = '+' + (summary.total_import || 0);
            document.getElementById('reportTotalExport').textContent = '-' + (summary.total_export || 0);
            document.getElementById('reportTotalClosing').textContent = summary.total_closing || 0;
            const summaryCard = document.getElementById('reportSummaryCard');
            if (summaryCard) summaryCard.style.display = 'grid';

        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
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
