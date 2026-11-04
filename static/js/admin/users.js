/**
 * Admin User Management Page Module (SPA)
 */

export const AdminUsersModule = {
    container: null,
    listeners: [],
    currentRoleFilter: 'all',
    usersList: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.currentRoleFilter = 'all';
        document.title = 'Quản Lý Người Dùng & Quản Trị Viên - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Tài Khoản Người Dùng & Phân Quyền';

        this.renderShell();
        this.bindEvents();
        await this.loadUsers();
    },

    renderShell() {
        this.container.innerHTML = `
            <!-- Role Tabs & Action Toolbar -->
            <div class="toolbar-card">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="userRoleFilterGroup">
                    <button class="btn btn-sm btn-primary user-role-btn" data-role="all">Tất cả</button>
                    <button class="btn btn-sm btn-secondary user-role-btn" data-role="customer">Khách hàng</button>
                    <button class="btn btn-sm btn-secondary user-role-btn" data-role="admin">Quản trị viên (Admin)</button>
                </div>

                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="min-width: 250px;">
                        <input type="text" id="searchUserInput" class="form-control" placeholder="Tìm tên đăng nhập, họ tên, SĐT...">
                    </div>
                    <button type="button" class="btn btn-primary" id="btnOpenAddAdmin">Thêm Tài Khoản Admin</button>
                </div>
            </div>

            <!-- Users Table -->
            <div class="table-card">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Đang tải danh sách người dùng...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Add Admin Modal -->
            <div id="addAdminModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 520px;">
                    <div class="admin-modal-header">
                        <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">Thêm Tài Khoản Quản Trị Viên (Admin)</h3>
                        <button class="modal-close" id="btnCloseAddAdminModal">&times;</button>
                    </div>
                    <form id="addAdminForm">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="newAdminUsername">Tên đăng nhập Admin (*)</label>
                            <input type="text" id="newAdminUsername" class="form-control" placeholder="Ví dụ: admin2, quanly1" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="newAdminPassword">Mật khẩu (*)</label>
                            <input type="password" id="newAdminPassword" class="form-control" placeholder="Nhập mật khẩu cho Admin mới" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label for="newAdminFullName">Họ và tên Quản trị viên (*)</label>
                            <input type="text" id="newAdminFullName" class="form-control" placeholder="Ví dụ: Nguyễn Văn Quản Lý" required>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                            <div class="form-group">
                                <label for="newAdminEmail">Email</label>
                                <input type="email" id="newAdminEmail" class="form-control" placeholder="admin@store.vn">
                            </div>
                            <div class="form-group">
                                <label for="newAdminPhone">Số điện thoại</label>
                                <input type="text" id="newAdminPhone" class="form-control" placeholder="0988776655">
                            </div>
                        </div>

                        <div class="admin-modal-footer">
                            <button type="button" class="btn btn-secondary" id="btnCancelAddAdmin">Hủy bỏ</button>
                            <button type="submit" class="btn btn-primary">Tạo Tài Khoản Admin</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Reset Password Modal -->
            <div id="resetPasswordModal" class="admin-modal-overlay" style="display:none;">
                <div class="admin-modal" style="max-width: 450px;">
                    <div class="admin-modal-header">
                        <h3 style="font-size: 1.1rem; font-weight: 700;">Đặt Lại Mật Khẩu</h3>
                        <button class="modal-close" id="btnCloseResetModal">&times;</button>
                    </div>
                    <form id="resetPasswordForm">
                        <input type="hidden" id="resetUserId">
                        <p style="font-size: 0.9rem; color: #475569; margin-bottom: 1rem;">
                            Bạn đang đặt lại mật khẩu cho tài khoản: <strong id="resetUsernameDisplay" style="color: #0f172a;"></strong>
                        </p>
                        <div class="form-group">
                            <label for="newPasswordInput">Mật khẩu mới (*)</label>
                            <input type="text" id="newPasswordInput" class="form-control" value="123456" required>
                        </div>
                        <div class="admin-modal-footer" style="margin-top: 1.25rem;">
                            <button type="button" class="btn btn-secondary" id="btnCancelResetModal">Hủy bỏ</button>
                            <button type="submit" class="btn btn-primary">Xác Nhận Đổi Mật Khẩu</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const roleGroup = document.getElementById('userRoleFilterGroup');
        if (roleGroup) {
            const onRole = (e) => {
                const btn = e.target.closest('.user-role-btn');
                if (btn) {
                    this.currentRoleFilter = btn.getAttribute('data-role');
                    roleGroup.querySelectorAll('.user-role-btn').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-secondary');
                    });
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-primary');
                    this.loadUsers();
                }
            };
            roleGroup.addEventListener('click', onRole);
            this.listeners.push({ el: roleGroup, type: 'click', fn: onRole });
        }

        const searchInput = document.getElementById('searchUserInput');
        if (searchInput) {
            let timeout = null;
            const onSearch = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.loadUsers(), 300);
            };
            searchInput.addEventListener('input', onSearch);
            this.listeners.push({ el: searchInput, type: 'input', fn: onSearch });
        }

        // Add Admin Modal Handlers
        const openAddBtn = document.getElementById('btnOpenAddAdmin');
        const addModal = document.getElementById('addAdminModal');
        const closeAddBtn = document.getElementById('btnCloseAddAdminModal');
        const cancelAddBtn = document.getElementById('btnCancelAddAdmin');
        const addForm = document.getElementById('addAdminForm');

        const openAddModal = () => {
            if (addForm) addForm.reset();
            if (addModal) addModal.style.display = 'flex';
        };
        const closeAddModal = () => {
            if (addModal) addModal.style.display = 'none';
        };

        if (openAddBtn) {
            openAddBtn.addEventListener('click', openAddModal);
            this.listeners.push({ el: openAddBtn, type: 'click', fn: openAddModal });
        }
        if (closeAddBtn) {
            closeAddBtn.addEventListener('click', closeAddModal);
            this.listeners.push({ el: closeAddBtn, type: 'click', fn: closeAddModal });
        }
        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', closeAddModal);
            this.listeners.push({ el: cancelAddBtn, type: 'click', fn: closeAddModal });
        }

        if (addForm) {
            const onAddSubmit = async (e) => {
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
                    closeAddModal();
                    await this.loadUsers();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            addForm.addEventListener('submit', onAddSubmit);
            this.listeners.push({ el: addForm, type: 'submit', fn: onAddSubmit });
        }

        // Reset Password Modal Handlers
        const resetModal = document.getElementById('resetPasswordModal');
        const closeResetBtn = document.getElementById('btnCloseResetModal');
        const cancelResetBtn = document.getElementById('btnCancelResetModal');
        const resetForm = document.getElementById('resetPasswordForm');
        const closeResetModal = () => { if (resetModal) resetModal.style.display = 'none'; };

        if (closeResetBtn) {
            closeResetBtn.addEventListener('click', closeResetModal);
            this.listeners.push({ el: closeResetBtn, type: 'click', fn: closeResetModal });
        }
        if (cancelResetBtn) {
            cancelResetBtn.addEventListener('click', closeResetModal);
            this.listeners.push({ el: cancelResetBtn, type: 'click', fn: closeResetModal });
        }

        if (resetForm) {
            const onResetSubmit = async (e) => {
                e.preventDefault();
                const userId = document.getElementById('resetUserId').value;
                const newPassword = document.getElementById('newPasswordInput').value.trim();

                try {
                    const res = await fetchAPI(`/api/admin/users/${userId}/reset-password`, {
                        method: 'POST',
                        body: JSON.stringify({ new_password: newPassword })
                    });
                    showToast(res.message, 'success');
                    closeResetModal();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            resetForm.addEventListener('submit', onResetSubmit);
            this.listeners.push({ el: resetForm, type: 'submit', fn: onResetSubmit });
        }

        // Event delegation on table body
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            const onTableClick = async (e) => {
                const lockBtn = e.target.closest('.btn-toggle-lock[data-id]');
                if (lockBtn) {
                    const id = parseInt(lockBtn.getAttribute('data-id'));
                    await this.toggleLock(id);
                    return;
                }

                const resetBtn = e.target.closest('.btn-open-reset[data-id]');
                if (resetBtn) {
                    const id = parseInt(resetBtn.getAttribute('data-id'));
                    const username = resetBtn.getAttribute('data-username');
                    document.getElementById('resetUserId').value = id;
                    document.getElementById('resetUsernameDisplay').textContent = username;
                    document.getElementById('newPasswordInput').value = '123456';
                    if (resetModal) resetModal.style.display = 'flex';
                    return;
                }

                const delBtn = e.target.closest('.btn-del-user[data-id]');
                if (delBtn) {
                    const id = parseInt(delBtn.getAttribute('data-id'));
                    const username = delBtn.getAttribute('data-username');
                    await this.deleteUser(id, username);
                    return;
                }
            };
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const searchVal = document.getElementById('searchUserInput')?.value.trim() || '';
        try {
            const res = await fetchAPI(`/api/admin/users?search=${encodeURIComponent(searchVal)}&role=${this.currentRoleFilter}`);
            this.usersList = res.users;

            if (this.usersList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">Không tìm thấy người dùng nào phù hợp</td></tr>';
                return;
            }

            tbody.innerHTML = this.usersList.map(u => `
                <tr>
                    <td>${u.id}</td>
                    <td><strong>${this.escapeHtml(u.username)}</strong></td>
                    <td>${this.escapeHtml(u.full_name)}</td>
                    <td>${this.escapeHtml(u.email || '—')}</td>
                    <td>${this.escapeHtml(u.phone || '—')}</td>
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
                                <button class="btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-lock" 
                                        data-id="${u.id}" title="Khóa/Mở khóa">
                                    ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-primary btn-open-reset" data-id="${u.id}" data-username="${this.escapeHtml(u.username)}" title="Đổi mật khẩu">
                                Đổi mật khẩu
                            </button>
                            ${u.role === 'customer' ? `
                                <button class="btn btn-sm btn-outline-danger btn-del-user" data-id="${u.id}" data-username="${this.escapeHtml(u.username)}" title="Xóa tài khoản khách hàng">
                                    Xóa
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Lỗi: ${e.message}</td></tr>`;
        }
    },

    async toggleLock(userId) {
        if (userId === 1) {
            showToast('Không thể khóa tài khoản Quản trị viên tối cao (ID: 1)!', 'error');
            return;
        }
        if (!confirm('Bạn có chắc muốn đổi trạng thái khóa/mở khóa tài khoản này?')) return;
        try {
            const res = await fetchAPI(`/api/admin/users/${userId}/toggle-lock`, { method: 'POST' });
            showToast(res.message, 'success');
            await this.loadUsers();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async deleteUser(userId, username) {
        if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản khách hàng "${username}"? Toàn bộ giỏ hàng và đơn hàng liên quan của khách sẽ bị xóa!`)) {
            return;
        }
        try {
            const res = await fetchAPI(`/api/admin/users/${userId}`, { method: 'DELETE' });
            showToast(res.message, 'success');
            await this.loadUsers();
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
