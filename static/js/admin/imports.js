/**
 * Admin Stock Imports Management Page Module (SPA)
 */

export const AdminImportsModule = {
    container: null,
    listeners: [],
    importReceipts: [],
    availableProducts: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.importReceipts = [];
        this.availableProducts = [];
        document.title = 'Quản Lý Nhập Hàng - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Nhập Kho Sản Phẩm';

        this.renderShell();
        this.bindEvents();
        await this.loadAvailableProducts();
        await this.loadImports();

        // Check if redirected with product_id (e.g. from Products or Stock page)
        const preselectedProdId = query.get('product_id');
        if (preselectedProdId) {
            this.openAddImportModal(parseInt(preselectedProdId));
        }
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Filter & Search Toolbar -->
            <div class="toolbar-card">
                <div class="filter-group">
                    <div class="form-group">
                        <label for="filterImportCode">Mã phiếu nhập</label>
                        <input type="text" id="filterImportCode" class="form-control" placeholder="PN-...">
                    </div>
                    <div class="form-group">
                        <label for="filterImportStatus">Trạng thái</label>
                        <select id="filterImportStatus" class="form-control">
                            <option value="">-- Tất cả trạng thái --</option>
                            <option value="draft">Bản nháp (Sửa được)</option>
                            <option value="completed">Đã hoàn thành (Đã cộng kho)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterImportFromDate">Từ ngày</label>
                        <input type="date" id="filterImportFromDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="filterImportToDate">Đến ngày</label>
                        <input type="date" id="filterImportToDate" class="form-control">
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-primary" id="btnOpenAddImport">Tạo Phiếu Nhập Hàng Mới</button>
                </div>
            </div>

            <div class="alert-banner alert-info">
                <span><strong>Quy định nghiệp vụ:</strong> Phiếu nhập hàng mới tạo sẽ ở trạng thái <em>Bản nháp</em> (cho phép tự do sửa và xóa). Chỉ khi bấm <strong>Hoàn thành</strong>, hệ thống mới cập nhật giá vốn và cộng dồn số lượng vào tồn kho, sau đó khóa phiếu không cho sửa nữa.</span>
            </div>

            <!-- Import Receipts Table -->
            <div class="table-card">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Mã phiếu</th>
                            <th>Ngày nhập</th>
                            <th>Quy mô nhập</th>
                            <th>Tổng tiền nhập</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="importsTableBody">
                        <tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Đang tải danh sách phiếu nhập...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Add / Edit Import Modal -->
            <div id="importModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 800px;">
                    <div class="admin-modal-header">
                        <h3 id="importModalTitle" style="font-size: 1.15rem; font-weight: 700;">Thêm Phiếu Nhập Hàng</h3>
                        <button class="modal-close" id="btnCloseImportModal">&times;</button>
                    </div>
                    <form id="importForm">
                        <input type="hidden" id="importId">

                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1.25rem;">
                            <div class="form-group">
                                <label for="importDateInput">Ngày nhập hàng (*)</label>
                                <input type="date" id="importDateInput" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="importNotesInput">Ghi chú phiếu nhập</label>
                                <input type="text" id="importNotesInput" class="form-control" placeholder="Ghi chú đợt nhập hàng, lô sản phẩm...">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <label style="font-weight: 700; font-size: 0.9rem; color: #0f172a;">Danh sách sản phẩm nhập kho:</label>
                            <button type="button" class="btn btn-sm btn-secondary" id="btnAddImportRow">Thêm dòng sản phẩm</button>
                        </div>

                        <!-- Dynamic items container -->
                        <div id="importItemsContainer" style="max-height: 280px; overflow-y: auto; padding-right: 0.25rem; margin-bottom: 1rem;"></div>

                        <div style="text-align: right; background: #fffbeb; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fef3c7; font-size: 1.15rem; font-weight: 800; color: #b45309;">
                            Tổng giá trị phiếu nhập: <span id="importGrandTotalDisplay">0 ₫</span>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" class="btn btn-secondary" id="btnCancelImportModal">Hủy bỏ</button>
                            <button type="submit" class="btn btn-primary">Lưu Phiếu Nhập (Bản nháp)</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Import Detail Modal -->
            <div id="importDetailModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 700px;">
                    <div class="admin-modal-header">
                        <h3 style="font-size: 1.15rem; font-weight: 700;">Chi Tiết Phiếu Nhập Hàng</h3>
                        <button class="modal-close" id="btnCloseDetailModal">&times;</button>
                    </div>
                    <div id="importDetailBody"></div>
                    <div class="admin-modal-footer" style="margin-top: 1.5rem;">
                        <button type="button" class="btn btn-secondary" id="btnDismissDetailModal">Đóng</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const codeInput = document.getElementById('filterImportCode');
        const statusSelect = document.getElementById('filterImportStatus');
        const fromDateInput = document.getElementById('filterImportFromDate');
        const toDateInput = document.getElementById('filterImportToDate');

        const onFilterChange = () => this.loadImports();

        if (codeInput) {
            let timeout = null;
            const onCode = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.loadImports(), 300);
            };
            codeInput.addEventListener('input', onCode);
            this.listeners.push({ el: codeInput, type: 'input', fn: onCode });
        }

        [statusSelect, fromDateInput, toDateInput].forEach(el => {
            if (el) {
                el.addEventListener('change', onFilterChange);
                this.listeners.push({ el, type: 'change', fn: onFilterChange });
            }
        });

        // Modals
        const importModal = document.getElementById('importModal');
        const openAddBtn = document.getElementById('btnOpenAddImport');
        const closeImportBtn = document.getElementById('btnCloseImportModal');
        const cancelImportBtn = document.getElementById('btnCancelImportModal');
        const addRowBtn = document.getElementById('btnAddImportRow');
        const importForm = document.getElementById('importForm');

        const closeImportModal = () => { if (importModal) importModal.style.display = 'none'; };

        if (openAddBtn) {
            const onOpen = () => this.openAddImportModal();
            openAddBtn.addEventListener('click', onOpen);
            this.listeners.push({ el: openAddBtn, type: 'click', fn: onOpen });
        }
        if (closeImportBtn) {
            closeImportBtn.addEventListener('click', closeImportModal);
            this.listeners.push({ el: closeImportBtn, type: 'click', fn: closeImportModal });
        }
        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', closeImportModal);
            this.listeners.push({ el: cancelImportBtn, type: 'click', fn: closeImportModal });
        }
        if (addRowBtn) {
            const onAddRow = () => this.addImportItemRow();
            addRowBtn.addEventListener('click', onAddRow);
            this.listeners.push({ el: addRowBtn, type: 'click', fn: onAddRow });
        }

        if (importForm) {
            const onSubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('importId').value;
                const importDate = document.getElementById('importDateInput').value;
                const notes = document.getElementById('importNotesInput').value.trim();

                const items = [];
                const rows = document.querySelectorAll('#importItemsContainer .import-item-row');
                rows.forEach(r => {
                    const prodId = r.querySelector('.import-prod-select').value;
                    const price = r.querySelector('.import-price-input').value;
                    const qty = r.querySelector('.import-qty-input').value;
                    if (prodId && price && qty) {
                        items.push({
                            product_id: parseInt(prodId),
                            import_price: parseFloat(price),
                            quantity: parseInt(qty)
                        });
                    }
                });

                if (items.length === 0) {
                    showToast('Vui lòng thêm ít nhất 1 sản phẩm vào phiếu nhập', 'error');
                    return;
                }

                const payload = {
                    import_date: importDate,
                    notes: notes,
                    items: items
                };

                try {
                    if (id) {
                        await fetchAPI(`/api/admin/imports/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        showToast('Cập nhật phiếu nhập thành công', 'success');
                    } else {
                        await fetchAPI('/api/admin/imports', { method: 'POST', body: JSON.stringify(payload) });
                        showToast('Tạo phiếu nhập thành công (Bản nháp)', 'success');
                    }
                    closeImportModal();
                    await this.loadImports();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            importForm.addEventListener('submit', onSubmit);
            this.listeners.push({ el: importForm, type: 'submit', fn: onSubmit });
        }

        // Detail Modal
        const detailModal = document.getElementById('importDetailModal');
        const closeDetailBtn = document.getElementById('btnCloseDetailModal');
        const dismissDetailBtn = document.getElementById('btnDismissDetailModal');
        const closeDetail = () => { if (detailModal) detailModal.style.display = 'none'; };

        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', closeDetail);
            this.listeners.push({ el: closeDetailBtn, type: 'click', fn: closeDetail });
        }
        if (dismissDetailBtn) {
            dismissDetailBtn.addEventListener('click', closeDetail);
            this.listeners.push({ el: dismissDetailBtn, type: 'click', fn: closeDetail });
        }

        // Table actions delegation
        const tbody = document.getElementById('importsTableBody');
        if (tbody) {
            const onTableClick = async (e) => {
                const detailBtn = e.target.closest('.btn-view-import[data-id]');
                if (detailBtn) {
                    const id = parseInt(detailBtn.getAttribute('data-id'));
                    await this.viewImportDetail(id);
                    return;
                }

                const editBtn = e.target.closest('.btn-edit-import[data-id]');
                if (editBtn) {
                    const id = parseInt(editBtn.getAttribute('data-id'));
                    await this.openEditImportModal(id);
                    return;
                }

                const completeBtn = e.target.closest('.btn-complete-import[data-id]');
                if (completeBtn) {
                    const id = parseInt(completeBtn.getAttribute('data-id'));
                    await this.completeImportReceipt(id);
                    return;
                }

                const delBtn = e.target.closest('.btn-del-import[data-id]');
                if (delBtn) {
                    const id = parseInt(delBtn.getAttribute('data-id'));
                    await this.deleteImportReceipt(id);
                    return;
                }
            };
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadAvailableProducts() {
        try {
            const res = await fetchAPI('/api/admin/products');
            this.availableProducts = res.products || [];
        } catch (e) {
            console.error(e);
        }
    },

    async loadImports() {
        const tbody = document.getElementById('importsTableBody');
        if (!tbody) return;

        const code = document.getElementById('filterImportCode')?.value.trim() || '';
        const status = document.getElementById('filterImportStatus')?.value || '';
        const fromDate = document.getElementById('filterImportFromDate')?.value || '';
        const toDate = document.getElementById('filterImportToDate')?.value || '';

        let url = `/api/admin/imports?code=${encodeURIComponent(code)}&status=${status}&from_date=${fromDate}&to_date=${toDate}`;

        try {
            const res = await fetchAPI(url);
            this.importReceipts = res.receipts || [];

            if (this.importReceipts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy phiếu nhập nào</td></tr>';
                return;
            }

            tbody.innerHTML = this.importReceipts.map(r => `
                <tr>
                    <td><strong>#${this.escapeHtml(r.receipt_code)}</strong></td>
                    <td>${formatDateOnly(r.import_date)}</td>
                    <td>${r.item_types_count} loại (${r.total_quantity} chiếc)</td>
                    <td style="font-weight:700; color:#b45309;">${formatVND(r.total_cost)}</td>
                    <td>
                        <span class="badge ${r.status === 'completed' ? 'completed' : 'draft'}">
                            ${r.status === 'completed' ? 'Đã hoàn thành' : 'Bản nháp (Sửa được)'}
                        </span>
                    </td>
                    <td>${this.escapeHtml(r.notes || '—')}</td>
                    <td>
                        <div style="display:flex; gap:0.4rem;">
                            <button class="btn btn-sm btn-secondary btn-view-import" data-id="${r.id}">Chi tiết</button>
                            ${r.status === 'draft' ? `
                                <button class="btn btn-sm btn-outline-primary btn-edit-import" data-id="${r.id}">Sửa</button>
                                <button class="btn btn-sm btn-outline-success btn-complete-import" data-id="${r.id}">Hoàn thành</button>
                                <button class="btn btn-sm btn-outline-danger btn-del-import" data-id="${r.id}">Xóa</button>
                            ` : `
                                <span style="color:#64748b; font-size:0.8rem; font-style:italic;">Đã khóa</span>
                            `}
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    openAddImportModal(preselectedProductId = null) {
        document.getElementById('importModalTitle').textContent = 'Thêm Phiếu Nhập Hàng (Bản nháp)';
        document.getElementById('importId').value = '';
        const now = new Date();
        const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        document.getElementById('importDateInput').value = localDateStr;
        document.getElementById('importNotesInput').value = '';
        document.getElementById('importItemsContainer').innerHTML = '';

        if (preselectedProductId) {
            this.addImportItemRow({ product_id: preselectedProductId, import_price: 0, quantity: 5 });
        } else {
            this.addImportItemRow();
        }

        const modal = document.getElementById('importModal');
        if (modal) modal.style.display = 'flex';
    },

    async openEditImportModal(receiptId) {
        try {
            const res = await fetchAPI(`/api/admin/imports/${receiptId}`);
            const r = res.receipt;

            if (r.status === 'completed') {
                showToast('Phiếu nhập đã hoàn thành không thể chỉnh sửa!', 'warning');
                return;
            }

            document.getElementById('importModalTitle').textContent = `Sửa Phiếu Nhập #${r.receipt_code}`;
            document.getElementById('importId').value = r.id;
            document.getElementById('importDateInput').value = r.import_date;
            document.getElementById('importNotesInput').value = r.notes || '';

            const container = document.getElementById('importItemsContainer');
            container.innerHTML = '';
            r.items.forEach(it => {
                this.addImportItemRow(it);
            });

            const modal = document.getElementById('importModal');
            if (modal) modal.style.display = 'flex';
        } catch (err) {
            showToast(err.message, 'error');
        }
    },

    addImportItemRow(existingItem = null) {
        const container = document.getElementById('importItemsContainer');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'import-item-row';
        row.style.cssText = 'display: grid; grid-template-columns: 3fr 1.5fr 1fr 1.5fr auto; gap: 0.75rem; align-items: end; margin-bottom: 0.75rem; background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #e2e8f0;';

        let defaultPrice = existingItem ? existingItem.import_price : 0;
        if (existingItem && existingItem.product_id && defaultPrice === 0) {
            const found = this.availableProducts.find(p => p.id === existingItem.product_id);
            if (found && found.cost_price) {
                defaultPrice = found.cost_price;
            }
        }

        const prodOptions = this.availableProducts.map(p => `
            <option value="${p.id}" ${existingItem && existingItem.product_id === p.id ? 'selected' : ''}>
                ${this.escapeHtml(p.code)} - ${this.escapeHtml(p.name)} (Tồn: ${p.stock_quantity})
            </option>
        `).join('');

        row.innerHTML = `
            <div class="form-group">
                <label style="font-size:0.75rem;">Sản phẩm</label>
                <select class="form-control import-prod-select" required>
                    <option value="">-- Chọn sản phẩm --</option>
                    ${prodOptions}
                </select>
            </div>
            <div class="form-group">
                <label style="font-size:0.75rem;">Giá nhập (VNĐ)</label>
                <input type="number" class="form-control import-price-input" min="0" step="1000" 
                       value="${defaultPrice}" required>
            </div>
            <div class="form-group">
                <label style="font-size:0.75rem;">Số lượng</label>
                <input type="number" class="form-control import-qty-input" min="1" 
                       value="${existingItem ? existingItem.quantity : 1}" required>
            </div>
            <div class="form-group">
                <label style="font-size:0.75rem;">Thành tiền</label>
                <span class="import-subtotal-text" style="font-weight:700; color:#b45309; line-height:36px;">0 ₫</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-row" style="height:36px;">&times;</button>
        `;

        const prodSelect = row.querySelector('.import-prod-select');
        const priceInput = row.querySelector('.import-price-input');
        const qtyInput = row.querySelector('.import-qty-input');
        const removeBtn = row.querySelector('.btn-remove-row');

        prodSelect.addEventListener('change', () => {
            const pId = parseInt(prodSelect.value);
            if (pId && parseFloat(priceInput.value || 0) === 0) {
                const found = this.availableProducts.find(p => p.id === pId);
                if (found && found.cost_price) {
                    priceInput.value = found.cost_price;
                }
            }
            this.calculateImportTotal();
        });

        priceInput.addEventListener('input', () => this.calculateImportTotal());
        qtyInput.addEventListener('input', () => this.calculateImportTotal());
        removeBtn.addEventListener('click', () => {
            row.remove();
            this.calculateImportTotal();
        });

        container.appendChild(row);
        this.calculateImportTotal();
    },

    calculateImportTotal() {
        let grandTotal = 0;
        const rows = document.querySelectorAll('#importItemsContainer .import-item-row');
        rows.forEach(r => {
            const price = parseFloat(r.querySelector('.import-price-input').value) || 0;
            const qty = parseInt(r.querySelector('.import-qty-input').value) || 0;
            const subtotal = price * qty;
            grandTotal += subtotal;
            const subtotalText = r.querySelector('.import-subtotal-text');
            if (subtotalText) subtotalText.textContent = formatVND(subtotal);
        });

        const totalEl = document.getElementById('importGrandTotalDisplay');
        if (totalEl) totalEl.textContent = formatVND(grandTotal);
    },

    async completeImportReceipt(receiptId) {
        if (!confirm('Xác nhận hoàn thành phiếu nhập này? Hệ thống sẽ cộng tồn kho và cập nhật giá vốn cho sản phẩm. Sau khi hoàn thành, phiếu nhập sẽ KHÔNG THỂ sửa đổi nữa!')) return;
        try {
            const res = await fetchAPI(`/api/admin/imports/${receiptId}/complete`, { method: 'POST' });
            showToast(res.message, 'success');
            await this.loadImports();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async deleteImportReceipt(receiptId) {
        if (!confirm('Bạn có chắc muốn xóa phiếu nhập bản nháp này?')) return;
        try {
            const res = await fetchAPI(`/api/admin/imports/${receiptId}`, { method: 'DELETE' });
            showToast(res.message, 'success');
            await this.loadImports();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async viewImportDetail(receiptId) {
        try {
            const res = await fetchAPI(`/api/admin/imports/${receiptId}`);
            const r = res.receipt;

            const content = `
                <div style="margin-bottom:1rem; font-size:0.92rem;">
                    <div><strong>Mã phiếu:</strong> #${this.escapeHtml(r.receipt_code)}</div>
                    <div><strong>Ngày nhập:</strong> ${formatDateOnly(r.import_date)}</div>
                    <div><strong>Trạng thái:</strong> <span class="badge ${r.status === 'completed' ? 'completed' : 'draft'}">${r.status === 'completed' ? 'Đã hoàn thành' : 'Bản nháp'}</span></div>
                    <div><strong>Ghi chú:</strong> ${this.escapeHtml(r.notes || 'Không có')}</div>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá nhập</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${r.items.map(it => `
                            <tr>
                                <td><strong>${this.escapeHtml(it.product_code)}</strong></td>
                                <td>${this.escapeHtml(it.product_name)}</td>
                                <td>${formatVND(it.import_price)}</td>
                                <td>${it.quantity}</td>
                                <td style="font-weight:700; color:#b45309;">${formatVND(it.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="text-align:right; margin-top:1rem; font-size:1.15rem; font-weight:700; color:#b45309;">
                    Tổng giá trị phiếu nhập: ${formatVND(r.total_cost)}
                </div>
            `;

            document.getElementById('importDetailBody').innerHTML = content;
            const modal = document.getElementById('importDetailModal');
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
