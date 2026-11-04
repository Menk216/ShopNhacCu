/**
 * Admin Category Management Page Module (SPA)
 */

export const AdminCategoriesModule = {
    container: null,
    listeners: [],
    categoriesList: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.categoriesList = [];
        document.title = 'Quản Lý Loại Sản Phẩm - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Loại Sản Phẩm Nhạc Cụ';

        this.renderShell();
        this.bindEvents();
        await this.loadCategories();
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Action Toolbar -->
            <div class="toolbar-card">
                <div>
                    <p style="font-size: 0.9rem; color: #64748b;">Quản lý các danh mục phân loại nhạc cụ, thiết lập % lợi nhuận định mức cho từng loại</p>
                </div>
                <div>
                    <button type="button" class="btn btn-primary" id="btnOpenAddCategory">Thêm Loại Sản Phẩm Mới</button>
                </div>
            </div>

            <!-- Categories Table -->
            <div class="table-card">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Mã loại</th>
                            <th>Tên loại sản phẩm</th>
                            <th>Mô tả</th>
                            <th>% Lợi nhuận mặc định</th>
                            <th>Số lượng SP</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
                        <tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Đang tải loại sản phẩm...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Add / Edit Category Modal -->
            <div id="categoryModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 520px;">
                    <div class="admin-modal-header">
                        <h3 id="catModalTitle" style="font-size: 1.1rem; font-weight: 700;">Thêm Loại Sản Phẩm</h3>
                        <button class="modal-close" id="btnCloseCatModal">&times;</button>
                    </div>
                    <form id="categoryForm">
                        <input type="hidden" id="catId">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="catCode">Mã loại sản phẩm (* Viết hoa, không dấu, ví dụ: GUITAR, PIANO)</label>
                            <input type="text" id="catCode" class="form-control" placeholder="GUITAR" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="catName">Tên loại sản phẩm (*)</label>
                            <input type="text" id="catName" class="form-control" placeholder="Đàn Guitar Acoustic & Classic" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="catMargin">Tỉ lệ % lợi nhuận mặc định (%)</label>
                            <input type="number" id="catMargin" class="form-control" min="0" step="0.5" value="20" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="catDesc">Mô tả loại sản phẩm</label>
                            <textarea id="catDesc" class="form-control" rows="2" placeholder="Mô tả tóm tắt phân loại"></textarea>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" class="btn btn-secondary" id="btnCancelCatModal">Hủy bỏ</button>
                            <button type="submit" class="btn btn-primary">Lưu Loại Sản Phẩm</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const modal = document.getElementById('categoryModal');
        const openBtn = document.getElementById('btnOpenAddCategory');
        const closeBtn = document.getElementById('btnCloseCatModal');
        const cancelBtn = document.getElementById('btnCancelCatModal');
        const form = document.getElementById('categoryForm');

        const openModal = (isEdit = false, cat = null) => {
            if (isEdit && cat) {
                document.getElementById('catModalTitle').textContent = 'Chỉnh Sửa Loại Sản Phẩm';
                document.getElementById('catId').value = cat.id;
                document.getElementById('catCode').value = cat.code;
                document.getElementById('catName').value = cat.name;
                document.getElementById('catMargin').value = cat.profit_margin_percent;
                document.getElementById('catDesc').value = cat.description || '';
            } else {
                document.getElementById('catModalTitle').textContent = 'Thêm Loại Sản Phẩm Mới';
                document.getElementById('catId').value = '';
                document.getElementById('catCode').value = '';
                document.getElementById('catName').value = '';
                document.getElementById('catMargin').value = '20';
                document.getElementById('catDesc').value = '';
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
                const id = document.getElementById('catId').value;
                const payload = {
                    code: document.getElementById('catCode').value.trim(),
                    name: document.getElementById('catName').value.trim(),
                    description: document.getElementById('catDesc').value.trim(),
                    profit_margin_percent: parseFloat(document.getElementById('catMargin').value)
                };

                try {
                    if (id) {
                        await fetchAPI(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        showToast('Cập nhật loại sản phẩm thành công', 'success');
                    } else {
                        await fetchAPI('/api/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
                        showToast('Thêm loại sản phẩm thành công', 'success');
                    }
                    closeModal();
                    await this.loadCategories();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            form.addEventListener('submit', onSubmit);
            this.listeners.push({ el: form, type: 'submit', fn: onSubmit });
        }

        // Table actions
        const tbody = document.getElementById('categoriesTableBody');
        if (tbody) {
            const onTableClick = async (e) => {
                const editBtn = e.target.closest('.btn-edit-cat[data-id]');
                if (editBtn) {
                    const id = parseInt(editBtn.getAttribute('data-id'));
                    const cat = this.categoriesList.find(c => c.id === id);
                    if (cat) openModal(true, cat);
                    return;
                }

                const toggleBtn = e.target.closest('.btn-toggle-cat[data-id]');
                if (toggleBtn) {
                    const id = parseInt(toggleBtn.getAttribute('data-id'));
                    await this.toggleStatus(id);
                    return;
                }

                const delBtn = e.target.closest('.btn-del-cat[data-id]');
                if (delBtn) {
                    const id = parseInt(delBtn.getAttribute('data-id'));
                    await this.deleteCategory(id);
                    return;
                }
            };
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadCategories() {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;

        try {
            const res = await fetchAPI('/api/admin/categories');
            this.categoriesList = res.categories;

            if (this.categoriesList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Chưa có loại sản phẩm nào</td></tr>';
                return;
            }

            tbody.innerHTML = this.categoriesList.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td><strong>${this.escapeHtml(c.code)}</strong></td>
                    <td>${this.escapeHtml(c.name)}</td>
                    <td>${this.escapeHtml(c.description || '—')}</td>
                    <td style="font-weight:700; color:#b45309;">${c.profit_margin_percent}%</td>
                    <td>${c.product_count} sản phẩm</td>
                    <td>
                        <span class="badge ${c.status === 'active' ? 'active' : 'hidden'}">
                            ${c.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex; gap:0.4rem;">
                            <button class="btn btn-sm btn-secondary btn-edit-cat" data-id="${c.id}">Sửa</button>
                            <button class="btn btn-sm ${c.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-cat" data-id="${c.id}">
                                ${c.status === 'active' ? 'Ẩn' : 'Hiện'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-del-cat" data-id="${c.id}" title="Xóa">Xóa</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    async toggleStatus(catId) {
        try {
            const res = await fetchAPI(`/api/admin/categories/${catId}/toggle-status`, { method: 'POST' });
            showToast(res.message, 'success');
            await this.loadCategories();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async deleteCategory(catId) {
        if (!confirm('Bạn có chắc muốn xóa loại sản phẩm này? (Nếu đã có sản phẩm thì chỉ có thể Ẩn)')) return;
        try {
            const res = await fetchAPI(`/api/admin/categories/${catId}`, { method: 'DELETE' });
            showToast(res.message, 'success');
            await this.loadCategories();
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
