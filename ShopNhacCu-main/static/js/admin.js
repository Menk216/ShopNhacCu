/**
 * Admin Panel JavaScript Logic
 */

// Universal modal helpers for admin
function openAdminModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeAdminModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

async function handleAdminLogout() {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất tài khoản Quản trị?')) return;
    try {
        await fetchAPI('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    } catch (e) {
        window.location.href = '/admin/login';
    }
}

// ---------------- 1. DASHBOARD STATS ----------------
async function initDashboard() {
    try {
        const res = await fetchAPI('/api/admin/dashboard-stats');
        const s = res.stats;
        document.getElementById('statRevenue').textContent = formatVND(s.total_revenue);
        document.getElementById('statOrders').textContent = s.total_orders;
        document.getElementById('statPendingOrders').textContent = s.pending_orders;
        document.getElementById('statProducts').textContent = s.total_products;
        document.getElementById('statCustomers').textContent = s.total_customers;
        document.getElementById('statLowStock').textContent = s.low_stock_products;

        const tableBody = document.getElementById('recentOrdersBody');
        if (tableBody) {
            const statusLabels = {
                'pending': '<span class="badge pending">Mới đặt</span>',
                'processing': '<span class="badge processing">Đã xử lý</span>',
                'delivered': '<span class="badge delivered">Đã giao</span>',
                'cancelled': '<span class="badge cancelled">Hủy</span>'
            };
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
}

// ---------------- 2. USER MANAGEMENT ----------------
let currentUsersList = [];
let currentRoleFilter = 'all';

async function loadAdminUsers(role = null) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (role !== null) {
        currentRoleFilter = role;
    }

    const searchVal = document.getElementById('searchUserInput')?.value.trim() || '';
    try {
        const res = await fetchAPI(`/api/admin/users?search=${encodeURIComponent(searchVal)}&role=${currentRoleFilter}`);
        currentUsersList = res.users;

        if (currentUsersList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy người dùng nào phù hợp</td></tr>';
            return;
        }

        tbody.innerHTML = currentUsersList.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.full_name}</td>
                <td>${u.email || '—'}</td>
                <td>${u.phone || '—'}</td>
                <td>
                    <span class="badge ${u.role === 'admin' ? 'completed' : 'processing'}">
                        ${u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                </td>
                <td>
                    <span class="badge ${u.status === 'active' ? 'active' : 'locked'}">
                        ${u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                </td>
                <td>
                    <div style="display:flex; gap:0.4rem;">
                        ${u.id !== 1 ? `
                            <button class="btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}" 
                                    onclick="toggleUserLock(${u.id})" title="Khóa/Mở khóa">
                                ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-primary" onclick="openResetPasswordModal(${u.id}, '${u.username}')" title="Đổi mật khẩu">
                            Đổi mật khẩu
                        </button>
                        ${u.role === 'customer' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id}, '${u.username}')" title="Xóa tài khoản khách hàng">
                                Xóa
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
    }
}

function openAddAdminModal() {
    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('newAdminFullName').value = '';
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('newAdminPhone').value = '';
    openAdminModal('addAdminModal');
}

async function submitCreateAdmin(e) {
    e.preventDefault();
    const payload = {
        username: document.getElementById('newAdminUsername').value.trim(),
        password: document.getElementById('newAdminPassword').value.trim(),
        full_name: document.getElementById('newAdminFullName').value.trim(),
        email: document.getElementById('newAdminEmail').value.trim(),
        phone: document.getElementById('newAdminPhone').value.trim()
    };

    try {
        const res = await fetchAPI('/api/admin/create-admin', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        showToast(res.message, 'success');
        closeAdminModal('addAdminModal');
        loadAdminUsers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function toggleUserLock(userId) {
    if (userId === 1) {
        showToast('Không thể khóa tài khoản Quản trị viên tối cao (ID: 1)!', 'error');
        return;
    }
    if (!confirm('Bạn có chắc muốn đổi trạng thái khóa/mở khóa tài khoản này?')) return;
    try {
        const res = await fetchAPI(`/api/admin/users/${userId}/toggle-lock`, { method: 'POST' });
        showToast(res.message, 'success');
        loadAdminUsers();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteUser(userId, username) {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản khách hàng "${username}"? Toàn bộ giỏ hàng và đơn hàng liên quan của khách sẽ bị xóa!`)) {
        return;
    }
    try {
        const res = await fetchAPI(`/api/admin/users/${userId}`, { method: 'DELETE' });
        showToast(res.message, 'success');
        loadAdminUsers();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function openResetPasswordModal(userId, username) {
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetUsernameDisplay').textContent = username;
    document.getElementById('newPasswordInput').value = '123456';
    openAdminModal('resetPasswordModal');
}

async function submitResetPassword(e) {
    e.preventDefault();
    const userId = document.getElementById('resetUserId').value;
    const newPassword = document.getElementById('newPasswordInput').value.trim();

    try {
        const res = await fetchAPI(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ new_password: newPassword })
        });
        showToast(res.message, 'success');
        closeAdminModal('resetPasswordModal');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---------------- 3. CATEGORY MANAGEMENT ----------------
let currentCategories = [];

async function loadAdminCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    try {
        const res = await fetchAPI('/api/admin/categories');
        currentCategories = res.categories;

        tbody.innerHTML = currentCategories.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td>${c.description || '—'}</td>
                <td style="font-weight:700; color:#b45309;">${c.profit_margin_percent}%</td>
                <td>${c.product_count} sản phẩm</td>
                <td>
                    <span class="badge ${c.status === 'active' ? 'active' : 'hidden'}">
                        ${c.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                    </span>
                </td>
                <td>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-sm btn-secondary" onclick="openEditCategoryModal(${c.id})">Sửa</button>
                        <button class="btn btn-sm ${c.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}" 
                                onclick="toggleCategoryStatus(${c.id})">
                            ${c.status === 'active' ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})" title="Xóa">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
    }
}

function openAddCategoryModal() {
    document.getElementById('catModalTitle').textContent = 'Thêm Loại Sản Phẩm Mới';
    document.getElementById('catId').value = '';
    document.getElementById('catCode').value = '';
    document.getElementById('catCode').disabled = false;
    document.getElementById('catName').value = '';
    document.getElementById('catDesc').value = '';
    document.getElementById('catMargin').value = 20.0;
    openAdminModal('categoryModal');
}

function openEditCategoryModal(catId) {
    const cat = currentCategories.find(c => c.id === catId);
    if (!cat) return;

    document.getElementById('catModalTitle').textContent = 'Chỉnh Sửa Loại Sản Phẩm';
    document.getElementById('catId').value = cat.id;
    document.getElementById('catCode').value = cat.code;
    document.getElementById('catName').value = cat.name;
    document.getElementById('catDesc').value = cat.description || '';
    document.getElementById('catMargin').value = cat.profit_margin_percent;
    openAdminModal('categoryModal');
}

async function submitCategoryForm(e) {
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
        closeAdminModal('categoryModal');
        loadAdminCategories();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function toggleCategoryStatus(catId) {
    try {
        const res = await fetchAPI(`/api/admin/categories/${catId}/toggle-status`, { method: 'POST' });
        showToast(res.message, 'success');
        loadAdminCategories();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteCategory(catId) {
    if (!confirm('Bạn có chắc muốn xóa loại sản phẩm này? (Nếu đã có sản phẩm thì chỉ có thể Ẩn)')) return;
    try {
        const res = await fetchAPI(`/api/admin/categories/${catId}`, { method: 'DELETE' });
        showToast(res.message, 'success');
        loadAdminCategories();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ---------------- 4. PRODUCT MANAGEMENT ----------------
let currentProducts = [];

async function loadAdminProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const catId = document.getElementById('filterCatSelect')?.value || '';
    const search = document.getElementById('searchProdInput')?.value.trim() || '';

    let url = `/api/admin/products?search=${encodeURIComponent(search)}`;
    if (catId) url += `&category_id=${catId}`;

    try {
        const res = await fetchAPI(url);
        currentProducts = res.products;

        if (currentProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy sản phẩm nào</td></tr>';
            return;
        }

        tbody.innerHTML = currentProducts.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>
                    <img src="${p.image_url}" alt="${p.name}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;">
                </td>
                <td><strong>${p.code}</strong></td>
                <td>
                    <div style="font-weight:600;">${p.name}</div>
                    <div style="font-size:0.75rem; color:#64748b;">${p.category_name}</div>
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
                        <button class="btn btn-sm btn-secondary" onclick="openEditProductModal(${p.id})">Sửa</button>
                        <button class="btn btn-sm ${p.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}" 
                                onclick="toggleProductStatus(${p.id})">
                            ${p.status === 'active' ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})" title="Xóa">Xóa</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
    }
}

async function populateCategoryDropdowns() {
    try {
        const res = await fetchAPI('/api/admin/categories');
        const options = res.categories.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('');
        
        const filterCat = document.getElementById('filterCatSelect');
        if (filterCat) {
            filterCat.innerHTML = '<option value="">-- Tất cả loại sản phẩm --</option>' + options;
        }

        const prodCat = document.getElementById('prodCategory');
        if (prodCat) {
            prodCat.innerHTML = '<option value="">-- Chọn loại sản phẩm --</option>' + options;
        }
    } catch (e) {
        console.error(e);
    }
}

function openAddProductModal() {
    document.getElementById('prodModalTitle').textContent = 'Thêm Sản Phẩm Mới';
    document.getElementById('prodId').value = '';
    document.getElementById('prodCategory').value = '';
    document.getElementById('prodCode').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodImage').value = '';
    document.getElementById('prodCostPrice').value = 0;
    document.getElementById('prodMargin').value = '';
    document.getElementById('prodDesc').value = '';
    openAdminModal('productModal');
}

async function openEditProductModal(prodId) {
    // CRITICAL: Fetch and accurately display existing information before editing
    try {
        const res = await fetchAPI(`/api/admin/products/${prodId}`);
        const p = res.product;

        document.getElementById('prodModalTitle').textContent = 'Sửa Thông Tin Sản Phẩm';
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodCategory').value = p.category_id;
        document.getElementById('prodCode').value = p.code;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodImage').value = p.image_url || '';
        document.getElementById('prodCostPrice').value = p.cost_price;
        document.getElementById('prodMargin').value = p.profit_margin_percent !== null && p.profit_margin_percent !== undefined ? p.profit_margin_percent : '';
        document.getElementById('prodDesc').value = p.description || '';

        openAdminModal('productModal');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function submitProductForm(e) {
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
        closeAdminModal('productModal');
        loadAdminProducts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function toggleProductStatus(prodId) {
    try {
        const res = await fetchAPI(`/api/admin/products/${prodId}/toggle-status`, { method: 'POST' });
        showToast(res.message, 'success');
        loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteProduct(prodId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này? (Nếu đã phát sinh đơn hàng hoặc phiếu nhập, hãy chọn Ẩn sản phẩm)')) return;
    try {
        const res = await fetchAPI(`/api/admin/products/${prodId}`, { method: 'DELETE' });
        showToast(res.message, 'success');
        loadAdminProducts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ---------------- 5. IMPORT MANAGEMENT (NHẬP HÀNG) ----------------
let currentImportReceipts = [];
let availableProductsForImport = [];

async function loadAdminImports() {
    const tbody = document.getElementById('importsTableBody');
    if (!tbody) return;

    const code = document.getElementById('filterImportCode')?.value.trim() || '';
    const status = document.getElementById('filterImportStatus')?.value || '';
    const fromDate = document.getElementById('filterImportFromDate')?.value || '';
    const toDate = document.getElementById('filterImportToDate')?.value || '';

    let url = `/api/admin/imports?code=${encodeURIComponent(code)}&status=${status}&from_date=${fromDate}&to_date=${toDate}`;

    try {
        const res = await fetchAPI(url);
        currentImportReceipts = res.receipts;

        if (currentImportReceipts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy phiếu nhập nào</td></tr>';
            return;
        }

        tbody.innerHTML = currentImportReceipts.map(r => `
            <tr>
                <td><strong>#${r.receipt_code}</strong></td>
                <td>${formatDateOnly(r.import_date)}</td>
                <td>${r.item_types_count} loại (${r.total_quantity} chiếc)</td>
                <td style="font-weight:700; color:#b45309;">${formatVND(r.total_cost)}</td>
                <td>
                    <span class="badge ${r.status === 'completed' ? 'completed' : 'draft'}">
                        ${r.status === 'completed' ? 'Đã hoàn thành' : 'Bản nháp (Sửa được)'}
                    </span>
                </td>
                <td>${r.notes || '—'}</td>
                <td>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-sm btn-secondary" onclick="viewImportDetail(${r.id})">Chi tiết</button>
                        ${r.status === 'draft' ? `
                            <button class="btn btn-sm btn-outline-primary" onclick="openEditImportModal(${r.id})">Sửa</button>
                            <button class="btn btn-sm btn-outline-success" onclick="completeImportReceipt(${r.id})">Hoàn thành</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteImportReceipt(${r.id})">Xóa</button>
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
}

async function loadProductsForImportDropdown() {
    try {
        const res = await fetchAPI('/api/admin/products');
        availableProductsForImport = res.products;
    } catch (e) {
        console.error(e);
    }
}

function handleImportProductChange(selectEl) {
    const prodId = parseInt(selectEl.value);
    const row = selectEl.closest('.import-item-row');
    if (!row) return;
    const priceInput = row.querySelector('.import-price-input');
    if (prodId && priceInput) {
        const prod = availableProductsForImport.find(p => p.id === prodId);
        if (prod && prod.cost_price && parseFloat(priceInput.value || 0) === 0) {
            priceInput.value = prod.cost_price;
        }
    }
    calculateImportTotal();
}

function addImportItemRow(existingItem = null) {
    const container = document.getElementById('importItemsContainer');
    const rowIndex = container.children.length;

    const row = document.createElement('div');
    row.className = 'import-item-row';
    row.style.cssText = 'display: grid; grid-template-columns: 3fr 1.5fr 1fr 1.5fr auto; gap: 0.75rem; align-items: end; margin-bottom: 0.75rem; background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #e2e8f0;';

    let defaultPrice = existingItem ? existingItem.import_price : 0;
    if (existingItem && existingItem.product_id && defaultPrice === 0) {
        const found = availableProductsForImport.find(p => p.id === existingItem.product_id);
        if (found && found.cost_price) {
            defaultPrice = found.cost_price;
        }
    }

    const prodOptions = availableProductsForImport.map(p => `
        <option value="${p.id}" ${existingItem && existingItem.product_id === p.id ? 'selected' : ''}>
            ${p.code} - ${p.name} (Tồn: ${p.stock_quantity})
        </option>
    `).join('');

    row.innerHTML = `
        <div class="form-group">
            <label style="font-size:0.75rem;">Sản phẩm</label>
            <select class="form-control import-prod-select" onchange="handleImportProductChange(this)" required>
                <option value="">-- Chọn sản phẩm --</option>
                ${prodOptions}
            </select>
        </div>
        <div class="form-group">
            <label style="font-size:0.75rem;">Giá nhập (VNĐ)</label>
            <input type="number" class="form-control import-price-input" min="0" step="1000" 
                   value="${defaultPrice}" oninput="calculateImportTotal()" required>
        </div>
        <div class="form-group">
            <label style="font-size:0.75rem;">Số lượng</label>
            <input type="number" class="form-control import-qty-input" min="1" 
                   value="${existingItem ? existingItem.quantity : 1}" oninput="calculateImportTotal()" required>
        </div>
        <div class="form-group">
            <label style="font-size:0.75rem;">Thành tiền</label>
            <span class="import-subtotal-text" style="font-weight:700; color:#b45309; line-height:36px;">0 ₫</span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.parentElement.remove(); calculateImportTotal();" style="height:36px;">&times;</button>
    `;

    container.appendChild(row);
    calculateImportTotal();
}

function calculateImportTotal() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('#importItemsContainer .import-item-row');
    rows.forEach(r => {
        const price = parseFloat(r.querySelector('.import-price-input').value) || 0;
        const qty = parseInt(r.querySelector('.import-qty-input').value) || 0;
        const subtotal = price * qty;
        grandTotal += subtotal;
        r.querySelector('.import-subtotal-text').textContent = formatVND(subtotal);
    });

    const totalEl = document.getElementById('importGrandTotalDisplay');
    if (totalEl) totalEl.textContent = formatVND(grandTotal);
}

function openAddImportModal(preselectedProductId = null) {
    document.getElementById('importModalTitle').textContent = 'Thêm Phiếu Nhập Hàng (Bản nháp)';
    document.getElementById('importId').value = '';
    document.getElementById('importDateInput').value = new Date().toISOString().split('T')[0];
    document.getElementById('importNotesInput').value = '';
    document.getElementById('importItemsContainer').innerHTML = '';
    if (preselectedProductId) {
        addImportItemRow({ product_id: parseInt(preselectedProductId), import_price: 0, quantity: 5 });
    } else {
        addImportItemRow();
    }
    openAdminModal('importModal');
}

async function openEditImportModal(receiptId) {
    // CRITICAL: Only editable before completion
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
            addImportItemRow(it);
        });

        openAdminModal('importModal');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function submitImportForm(e) {
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
        closeAdminModal('importModal');
        loadAdminImports();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function completeImportReceipt(receiptId) {
    if (!confirm('Xác nhận hoàn thành phiếu nhập này? Hệ thống sẽ cộng tồn kho và cập nhật giá vốn cho sản phẩm. Sau khi hoàn thành, phiếu nhập sẽ KHÔNG THỂ sửa đổi nữa!')) return;
    try {
        const res = await fetchAPI(`/api/admin/imports/${receiptId}/complete`, { method: 'POST' });
        showToast(res.message, 'success');
        loadAdminImports();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function deleteImportReceipt(receiptId) {
    if (!confirm('Bạn có chắc muốn xóa phiếu nhập bản nháp này?')) return;
    try {
        const res = await fetchAPI(`/api/admin/imports/${receiptId}`, { method: 'DELETE' });
        showToast(res.message, 'success');
        loadAdminImports();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function viewImportDetail(receiptId) {
    try {
        const res = await fetchAPI(`/api/admin/imports/${receiptId}`);
        const r = res.receipt;

        let content = `
            <div style="margin-bottom:1rem; font-size:0.92rem;">
                <div><strong>Mã phiếu:</strong> #${r.receipt_code}</div>
                <div><strong>Ngày nhập:</strong> ${formatDateOnly(r.import_date)}</div>
                <div><strong>Trạng thái:</strong> <span class="badge ${r.status === 'completed' ? 'completed' : 'draft'}">${r.status === 'completed' ? 'Đã hoàn thành' : 'Bản nháp'}</span></div>
                <div><strong>Ghi chú:</strong> ${r.notes || 'Không có'}</div>
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
                            <td><strong>${it.product_code}</strong></td>
                            <td>${it.product_name}</td>
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
        openAdminModal('importDetailModal');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ---------------- 6. PRICING & PROFIT MARGIN ----------------
async function loadAdminPricing() {
    try {
        const res = await fetchAPI('/api/admin/pricing');
        
        // 1. Categories table
        const catTbody = document.getElementById('pricingCategoriesTableBody');
        if (catTbody) {
            catTbody.innerHTML = res.categories.map(c => `
                <tr>
                    <td><strong>${c.code}</strong></td>
                    <td>${c.name}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <input type="number" id="catMargin_${c.id}" class="form-control" style="width:90px;" min="0" step="0.5" value="${c.profit_margin_percent}">
                            <span>%</span>
                            <button class="btn btn-sm btn-primary" onclick="saveCategoryMargin(${c.id})">Lưu</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // 2. Products table (Tra cứu giá vốn, % lợi nhuận, giá bán)
        const prodTbody = document.getElementById('pricingProductsTableBody');
        if (prodTbody) {
            prodTbody.innerHTML = res.products.map(p => `
                <tr>
                    <td><strong>${p.code}</strong></td>
                    <td>${p.name}</td>
                    <td>${p.category_name}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:0.4rem;">
                            <input type="number" id="prodCost_${p.id}" class="form-control" style="width:120px;" min="0" step="10000" value="${p.cost_price}">
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; align-items:center; gap:0.4rem;">
                            <input type="number" id="prodMargin_${p.id}" class="form-control" style="width:80px;" min="0" step="0.5" 
                                   placeholder="${p.category_profit_margin}%" 
                                   value="${p.profit_margin_percent !== null && p.profit_margin_percent !== undefined ? p.profit_margin_percent : ''}">
                            <span>%</span>
                        </div>
                        <div style="font-size:0.75rem; color:#64748b;">
                            ${p.is_custom_margin ? 'Áp dụng riêng' : 'Theo loại (' + p.category_profit_margin + '%)'}
                        </div>
                    </td>
                    <td style="font-weight:700; color:#b45309; font-size:1rem;">
                        ${formatVND(p.selling_price)}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="saveProductPricing(${p.id})">Cập nhật</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

async function saveCategoryMargin(catId) {
    const val = document.getElementById(`catMargin_${catId}`).value;
    try {
        const res = await fetchAPI(`/api/admin/pricing/category/${catId}`, {
            method: 'PUT',
            body: JSON.stringify({ profit_margin_percent: parseFloat(val) })
        });
        showToast(res.message, 'success');
        loadAdminPricing();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function saveProductPricing(prodId) {
    const costVal = document.getElementById(`prodCost_${prodId}`).value;
    const marginVal = document.getElementById(`prodMargin_${prodId}`).value.trim();

    const payload = {
        cost_price: parseFloat(costVal) || 0,
        profit_margin_percent: marginVal !== '' ? parseFloat(marginVal) : null
    };

    try {
        const res = await fetchAPI(`/api/admin/pricing/product/${prodId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        showToast(res.message, 'success');
        loadAdminPricing();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ---------------- 7. ORDER MANAGEMENT ----------------
let currentAdminOrders = [];

async function loadAdminOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const fromDate = document.getElementById('filterOrderFromDate')?.value || '';
    const toDate = document.getElementById('filterOrderToDate')?.value || '';
    const status = document.getElementById('filterOrderStatus')?.value || '';
    const search = document.getElementById('filterOrderSearch')?.value.trim() || '';

    let url = `/api/admin/orders?from_date=${fromDate}&to_date=${toDate}&status=${status}&search=${encodeURIComponent(search)}`;

    try {
        const res = await fetchAPI(url);
        currentAdminOrders = res.orders;

        if (currentAdminOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy đơn hàng nào phù hợp điều kiện lọc</td></tr>';
            return;
        }

        const statusLabels = {
            'pending': { label: 'Mới đặt', class: 'badge pending' },
            'processing': { label: 'Đã xử lý', class: 'badge processing' },
            'delivered': { label: 'Đã giao', class: 'badge delivered' },
            'cancelled': { label: 'Hủy', class: 'badge cancelled' }
        };

        tbody.innerHTML = currentAdminOrders.map(o => {
            const s = statusLabels[o.order_status] || { label: o.order_status, class: 'badge' };
            return `
                <tr>
                    <td><strong>#${o.order_code}</strong></td>
                    <td>${formatDate(o.created_at)}</td>
                    <td>
                        <div style="font-weight:600;">${o.recipient_name}</div>
                        <div style="font-size:0.75rem; color:#64748b;">${o.recipient_phone}</div>
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
                        <button class="btn btn-sm btn-secondary" onclick="openAdminOrderDetail(${o.id})">Chi tiết & Cập nhật</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
    }
}

async function openAdminOrderDetail(orderId) {
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
                    <div><strong>Tài khoản đặt:</strong> ${o.customer_account_name || o.username}</div>
                    <div><strong>Người nhận:</strong> ${o.recipient_name}</div>
                    <div><strong>SĐT liên hệ:</strong> ${o.recipient_phone}</div>
                    <div><strong>Địa chỉ giao:</strong> ${o.recipient_address}</div>
                </div>
                <div>
                    <div><strong>Ngày đặt hàng:</strong> ${formatDate(o.created_at)}</div>
                    <div><strong>Hình thức thanh toán:</strong> ${o.payment_method.toUpperCase()}</div>
                    <div><strong>Ghi chú:</strong> ${o.notes || 'Không có'}</div>
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
                            <td>${it.product_name}</td>
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
        openAdminModal('orderDetailModal');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function submitUpdateOrderStatus(e) {
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
        closeAdminModal('orderDetailModal');
        loadAdminOrders();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---------------- 8. INVENTORY & NHẬP - XUẤT - TỒN REPORT ----------------
async function loadCurrentStock() {
    const tbody = document.getElementById('currentStockTableBody');
    if (!tbody) return;

    const catId = document.getElementById('invCatSelect')?.value || '';
    const lowStockOnly = document.getElementById('invLowStockCheck')?.checked || false;

    let url = `/api/admin/inventory/current?low_stock_only=${lowStockOnly}`;
    if (catId) url += `&category_id=${catId}`;

    try {
        const res = await fetchAPI(url);
        const list = res.inventory;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#64748b;">Không có dữ liệu tồn kho</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(item => `
            <tr ${item.is_low_stock ? 'style="background-color: #fffbeb;"' : ''}>
                <td><strong>${item.code}</strong></td>
                <td>
                    <div style="font-weight:600;">${item.name}</div>
                </td>
                <td>${item.category_name}</td>
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
}

async function generateInventoryReport() {
    const tbody = document.getElementById('inventoryReportTableBody');
    if (!tbody) return;

    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const catId = document.getElementById('reportCatSelect').value;

    let url = `/api/admin/inventory/report?from_date=${fromDate}&to_date=${toDate}`;
    if (catId) url += `&category_id=${catId}`;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Đang tính toán số liệu Nhập - Xuất - Tồn...</td></tr>';

    try {
        const res = await fetchAPI(url);
        const list = res.report;
        const summary = res.summary;

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Không có dữ liệu trong khoảng thời gian đã chọn</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(item => `
            <tr>
                <td><strong>${item.product_code}</strong></td>
                <td>${item.product_name}</td>
                <td>${item.category_name}</td>
                <td style="font-weight:600; text-align:center;">${item.opening_stock}</td>
                <td style="font-weight:700; color:#16a34a; text-align:center;">+${item.import_qty}</td>
                <td style="font-weight:700; color:#dc2626; text-align:center;">-${item.export_qty}</td>
                <td style="font-weight:800; color:#b45309; text-align:center; font-size:1.05rem;">${item.closing_stock}</td>
                <td style="text-align:center; color:#64748b;">${item.current_actual_stock}</td>
            </tr>
        `).join('');

        // Summary row
        document.getElementById('reportTotalOpening').textContent = summary.total_opening;
        document.getElementById('reportTotalImport').textContent = '+' + summary.total_import;
        document.getElementById('reportTotalExport').textContent = '-' + summary.total_export;
        document.getElementById('reportTotalClosing').textContent = summary.total_closing;
        document.getElementById('reportSummaryCard').style.display = 'grid';

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
    }
}
