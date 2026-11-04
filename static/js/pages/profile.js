/**
 * Customer Profile Page Module (SPA)
 */

export const ProfileModule = {
    container: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        document.title = 'Hồ Sơ Cá Nhân - Melody Store';

        this.renderShell();
        this.bindEvents();
        await this.loadProfileData();
    },

    renderShell() {
        this.container.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto;">
                <div style="margin-bottom: 2rem;">
                    <h1 style="font-size: 1.6rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Thông Tin Tài Khoản</h1>
                    <p style="color: #64748b; font-size: 0.9rem;">Quản lý và cập nhật thông tin cá nhân và địa chỉ nhận hàng mặc định</p>
                </div>

                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                    <form id="profileForm">
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label for="profUsername">Tên đăng nhập</label>
                            <input type="text" id="profUsername" class="form-control" disabled style="background: #f1f5f9;">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label for="profFullName">Họ và tên (*)</label>
                            <input type="text" id="profFullName" class="form-control" required>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                            <div class="form-group">
                                <label for="profEmail">Email liên hệ</label>
                                <input type="email" id="profEmail" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="profPhone">Số điện thoại (*)</label>
                                <input type="text" id="profPhone" class="form-control" placeholder="10 số (VD: 0901234567)" required maxlength="10">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label for="profAddress">Địa chỉ nhận hàng mặc định (*)</label>
                            <textarea id="profAddress" class="form-control" rows="3" required></textarea>
                        </div>

                        <div style="border-top: 1px dashed #e2e8f0; padding-top: 1.25rem; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">Đổi mật khẩu (Bỏ trống nếu không muốn đổi):</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label for="profOldPass">Mật khẩu cũ</label>
                                    <input type="password" id="profOldPass" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="profNewPass">Mật khẩu mới</label>
                                    <input type="password" id="profNewPass" class="form-control">
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn-checkout" style="margin-top: 0;">Lưu Thay Đổi</button>
                    </form>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const form = document.getElementById('profileForm');
        const phoneInput = document.getElementById('profPhone');

        if (phoneInput) {
            const onPhone = (e) => {
                phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
            };
            phoneInput.addEventListener('input', onPhone);
            this.listeners.push({ el: phoneInput, type: 'input', fn: onPhone });
        }

        if (form) {
            const onSubmit = async (e) => {
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
                    // Update user name in header
                    const userBtnSpan = document.querySelector('.user-btn span:first-child');
                    if (userBtnSpan) userBtnSpan.textContent = payload.full_name;
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            form.addEventListener('submit', onSubmit);
            this.listeners.push({ el: form, type: 'submit', fn: onSubmit });
        }
    },

    async loadProfileData() {
        try {
            const res = await fetchAPI('/api/auth/profile');
            const user = res.user;
            document.getElementById('profUsername').value = user.username || '';
            document.getElementById('profFullName').value = user.full_name || '';
            document.getElementById('profEmail').value = user.email || '';
            document.getElementById('profPhone').value = user.phone || '';
            document.getElementById('profAddress').value = user.address || '';
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
