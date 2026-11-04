/**
 * Admin Product Management Page Module (SPA)
 */

export const AdminProductsModule = {
    container: null,
    listeners: [],
    productsList: [],
    categoriesList: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.productsList = [];
        this.categoriesList = [];
        document.title = 'Quản Lý Sản Phẩm - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Danh Mục Sản Phẩm Nhạc Cụ';

        this.renderShell();
        this.bindEvents();
        await this.loadCategoriesDropdown();
        await this.loadProducts();
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Filter & Action Toolbar -->
            <div class="toolbar-card">
                <div class="filter-group">
                    <div class="form-group">
                        <label for="filterCatSelect">Lọc theo loại sản phẩm</label>
                        <select id="filterCatSelect" class="form-control">
                            <option value="">-- Tất cả loại sản phẩm --</option>
                        </select>
                    </div>
                    <div class="form-group" style="min-width: 260px;">
                        <label for="searchProdInput">Tìm kiếm theo tên / mã SP</label>
                        <input type="text" id="searchProdInput" class="form-control" placeholder="Tên đàn, mã sản phẩm...">
                    </div>
                </div>
                <div>
                    <button type="button" class="btn btn-primary" id="btnOpenAddProduct">Thêm Sản Phẩm Mới</button>
                </div>
            </div>

            <!-- Products Table -->
            <div class="table-card">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm & Loại</th>
                            <th>Giá vốn (VNĐ)</th>
                            <th>% Lợi nhuận</th>
                            <th>Giá bán (VNĐ)</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        <tr><td colspan="10" style="text-align:center; padding:2rem; color:#64748b;">Đang tải danh sách sản phẩm...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Add / Edit Product Modal -->
            <div id="productModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h3 id="prodModalTitle" style="font-size: 1.15rem; font-weight: 700;">Thêm Sản Phẩm Mới</h3>
                        <button class="modal-close" id="btnCloseProdModal">&times;</button>
                    </div>
                    <form id="productForm">
                        <input type="hidden" id="prodId">

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label for="prodCategory">Loại sản phẩm (*)</label>
                                <select id="prodCategory" class="form-control" required>
                                    <option value="">-- Chọn loại sản phẩm --</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="prodCode">Mã sản phẩm (* Viết hoa, không dấu, ví dụ: GTR-YAM-F310)</label>
                                <input type="text" id="prodCode" class="form-control" placeholder="Mã sản phẩm" required>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="prodName">Tên sản phẩm (*)</label>
                            <input type="text" id="prodName" class="form-control" placeholder="Ví dụ: Đàn Guitar Acoustic Yamaha F310" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="prodImage">Đường dẫn hình ảnh (URL)</label>
                            <input type="text" id="prodImage" class="form-control" placeholder="https://example.com/guitar.jpg">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div class="form-group">
                                <label for="prodCostPrice">Giá vốn ban đầu (VNĐ)</label>
                                <input type="number" id="prodCostPrice" class="form-control" min="0" step="10000" placeholder="0">
                            </div>
                            <div class="form-group">
                                <label for="prodMargin">% Lợi nhuận riêng (Bỏ trống nếu theo loại)</label>
                                <input type="number" id="prodMargin" class="form-control" min="0" step="0.5" placeholder="Để trống để áp dụng theo loại">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label for="prodDesc">Mô tả thông tin chi tiết nhạc cụ</label>
                            <textarea id="prodDesc" class="form-control" rows="4" placeholder="Mô tả chất liệu gỗ, âm thanh, tính năng kỹ thuật..."></textarea>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" class="btn btn-secondary" id="btnCancelProdModal">Hủy bỏ</button>
                            <button type="submit" class="btn btn-primary">Lưu Sản Phẩm</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const filterCat = document.getElementById('filterCatSelect');
        if (filterCat) {
            const onCatChange = () => this.loadProducts();
            filterCat.addEventListener('change', onCatChange);
            this.listeners.push({ el: filterCat, type: 'change', fn: onCatChange });
        }

        const searchInput = document.getElementById('searchProdInput');
        if (searchInput) {
            let timeout = null;
            const onSearch = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.loadProducts(), 300);
            };
            searchInput.addEventListener('input', onSearch);
            this.listeners.push({ el: searchInput, type: 'input', fn: onSearch });
        }

        const modal = document.getElementById('productModal');
        const openBtn = document.getElementById('btnOpenAddProduct');
        const closeBtn = document.getElementById('btnCloseProdModal');
        const cancelBtn = document.getElementById('btnCancelProdModal');
        const form = document.getElementById('productForm');

        const openModal = (isEdit = false, p = null) => {
            if (isEdit && p) {
                document.getElementById('prodModalTitle').textContent = 'Sửa Thông Tin Sản Phẩm';
                document.getElementById('prodId').value = p.id;
                document.getElementById('prodCategory').value = p.category_id;
                document.getElementById('prodCode').value = p.code;
                document.getElementById('prodName').value = p.name;
                document.getElementById('prodImage').value = p.image_url || '';
                document.getElementById('prodCostPrice').value = p.cost_price;
                document.getElementById('prodMargin').value = (p.profit_margin_percent !== null && p.profit_margin_percent !== undefined) ? p.profit_margin_percent : '';
                document.getElementById('prodDesc').value = p.description || '';
            } else {
                document.getElementById('prodModalTitle').textContent = 'Thêm Sản Phẩm Mới';
                document.getElementById('prodId').value = '';
                document.getElementById('prodCategory').value = '';
                document.getElementById('prodCode').value = '';
                document.getElementById('prodName').value = '';
                document.getElementById('prodImage').value = '';
                document.getElementById('prodCostPrice').value = 0;
                document.getElementById('prodMargin').value = '';
                document.getElementById('prodDesc').value = '';
            }
            if (modal) modal.style.display = 'flex';
        };

        const closeModal = () => { if (modal) modal.style.display = 'none'; };

        if (openBtn) {
            const onOpen = () => openModal(false);
            openBtn.addEventListener('click', onOpen);
            this.listeners.push({ el: openBtn, type: 'click', fn: onOpen });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: closeBtn, type: 'click', fn: closeModal });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
            this.listeners.push({ el: cancelBtn, type: 'click', fn: closeModal });
        }

        if (form) {
            const onSubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('prodId').value;
                const marginInput = document.getElementById('prodMargin').value.trim();

                const payload = {
                    category_id: parseInt(document.getElementById('prodCategory').value),
                    code: document.getElementById('prodCode').value.trim(),
                    name: document.getElementById('prodName').value.trim(),
                    image_url: document.getElementById('prodImage').value.trim(),
                    cost_price: parseFloat(document.getElementById('prodCostPrice').value) || 0,
                    profit_margin_percent: marginInput !== '' ? parseFloat(marginInput) : null,
                    description: document.getElementById('prodDesc').value.trim()
                };

                try {
                    if (id) {
                        await fetchAPI(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        showToast('Cập nhật sản phẩm thành công', 'success');
                    } else {
                        await fetchAPI('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
                        showToast('Thêm sản phẩm thành công', 'success');
                    }
                    closeModal();
                    await this.loadProducts();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            form.addEventListener('submit', onSubmit);
            this.listeners.push({ el: form, type: 'submit', fn: onSubmit });
        }

        // Table actions
        const tbody = document.getElementById('productsTableBody');
        if (tbody) {
            const onTableClick = async (e) => {
                const editBtn = e.target.closest('.btn-edit-prod[data-id]');
                if (editBtn) {
                    const id = parseInt(editBtn.getAttribute('data-id'));
                    try {
                        const res = await fetchAPI(`/api/admin/products/${id}`);
                        openModal(true, res.product);
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                    return;
                }

                const toggleBtn = e.target.closest('.btn-toggle-prod[data-id]');
                if (toggleBtn) {
                    const id = parseInt(toggleBtn.getAttribute('data-id'));
                    await this.toggleStatus(id);
                    return;
                }

                const delBtn = e.target.closest('.btn-del-prod[data-id]');
                if (delBtn) {
                    const id = parseInt(delBtn.getAttribute('data-id'));
                    await this.deleteProduct(id);
                    return;
                }
            };
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadCategoriesDropdown() {
        try {
            const res = await fetchAPI('/api/admin/categories');
            this.categoriesList = res.categories;
            const options = this.categoriesList.map(c => `<option value="${c.id}">${this.escapeHtml(c.name)} (${this.escapeHtml(c.code)})</option>`).join('');

            const filterCat = document.getElementById('filterCatSelect');
            if (filterCat) filterCat.innerHTML = '<option value="">-- Tất cả loại sản phẩm --</option>' + options;

            const prodCat = document.getElementById('prodCategory');
            if (prodCat) prodCat.innerHTML = '<option value="">-- Chọn loại sản phẩm --</option>' + options;
        } catch (e) {
            console.error(e);
        }
    },

    async loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        const catId = document.getElementById('filterCatSelect')?.value || '';
        const search = document.getElementById('searchProdInput')?.value.trim() || '';

        let url = `/api/admin/products?search=${encodeURIComponent(search)}`;
        if (catId) url += `&category_id=${catId}`;

        try {
            const res = await fetchAPI(url);
            this.productsList = res.products;

            if (this.productsList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy sản phẩm nào</td></tr>';
                return;
            }

            tbody.innerHTML = this.productsList.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td>
                        <img src="${p.image_url}" alt="${this.escapeHtml(p.name)}" 
                             onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'"
                             style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;">
                    </td>
                    <td><strong>${this.escapeHtml(p.code)}</strong></td>
                    <td>
                        <div style="font-weight:600;">${this.escapeHtml(p.name)}</div>
                        <div style="font-size:0.75rem; color:#64748b;">${this.escapeHtml(p.category_name)}</div>
                    </td>
                    <td>${formatVND(p.cost_price)}</td>
                    <td style="color:#b45309; font-weight:600;">
                        ${p.profit_margin_percent !== null && p.profit_margin_percent !== undefined ? p.profit_margin_percent + '% (Riêng)' : p.category_profit_margin + '% (Theo loại)'}
                    </td>
                    <td style="font-weight:700; color:#b45309;">${formatVND(p.selling_price)}</td>
                    <td>
                        <span class="badge ${p.stock_quantity <= 5 ? (p.stock_quantity === 0 ? 'danger' : 'warning') : 'active'}">
                            ${p.stock_quantity}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${p.status === 'active' ? 'active' : 'hidden'}">
                            ${p.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex; gap:0.4rem;">
                            <a href="/admin/imports?product_id=${p.id}" class="btn btn-sm btn-outline-primary" title="Tạo phiếu nhập hàng cho sản phẩm này">Nhập hàng</a>
                            <button class="btn btn-sm btn-secondary btn-edit-prod" data-id="${p.id}">Sửa</button>
                            <button class="btn btn-sm ${p.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-prod" data-id="${p.id}">
                                ${p.status === 'active' ? 'Ẩn' : 'Hiện'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-del-prod" data-id="${p.id}" title="Xóa">Xóa</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="10" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    async toggleStatus(prodId) {
        try {
            const res = await fetchAPI(`/api/admin/products/${prodId}/toggle-status`, { method: 'POST' });
            showToast(res.message, 'success');
            await this.loadProducts();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async deleteProduct(prodId) {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này? (Nếu đã phát sinh đơn hàng hoặc phiếu nhập, hãy chọn Ẩn sản phẩm)')) return;
        try {
            const res = await fetchAPI(`/api/admin/products/${prodId}`, { method: 'DELETE' });
            showToast(res.message, 'success');
            await this.loadProducts();
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
