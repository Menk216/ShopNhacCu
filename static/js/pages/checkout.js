/**
 * Checkout Page Module (SPA)
 */

export const CheckoutModule = {
    container: null,
    listeners: [],
    currentUser: null,

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        document.title = 'Thanh Toán & Đặt Hàng - Melody Store';

        // Get user profile info
        try {
            const meRes = await fetchAPI('/api/auth/me');
            this.currentUser = meRes.user;
        } catch (e) {
            // Unauthenticated
            window.location.href = '/login?next=/checkout';
            return;
        }

        this.renderShell();
        this.bindEvents();
        await this.loadCheckoutSummary();
    },

    renderShell() {
        const u = this.currentUser || {};
        const hasContact = u.phone && u.address;

        this.container.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Thanh Toán Đơn Hàng</h1>
                <p style="color: #64748b; font-size: 0.9rem;">Vui lòng chọn địa chỉ nhận hàng và hình thức thanh toán phù hợp</p>
            </div>

            <form id="checkoutForm">
                <div class="cart-layout">
                    <!-- Left Column: Shipping & Payment Details -->
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- 1. Shipping Address Selection -->
                        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                            <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                1. Địa Chỉ Nhận Hàng
                            </h3>

                            <div style="display: flex; gap: 1.5rem; margin-bottom: 1.25rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.92rem;">
                                    <input type="radio" name="address_mode" id="addrModeProfile" value="profile" ${hasContact ? 'checked' : ''}>
                                    <span>Sử dụng địa chỉ từ tài khoản</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.92rem;">
                                    <input type="radio" name="address_mode" id="addrModeNew" value="new" ${!hasContact ? 'checked' : ''}>
                                    <span>Nhập địa chỉ giao hàng mới</span>
                                </label>
                            </div>

                            <!-- Preview of Profile Address -->
                            <div id="profileAddressPreview" style="display: ${hasContact ? 'block' : 'none'}; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; font-size: 0.9rem; line-height: 1.6;">
                                <div><strong>Người nhận:</strong> ${this.escapeHtml(u.full_name)}</div>
                                <div><strong>Số điện thoại:</strong> ${this.escapeHtml(u.phone || 'Chưa cập nhật')}</div>
                                <div><strong>Địa chỉ:</strong> ${this.escapeHtml(u.address || 'Chưa cập nhật địa chỉ')}</div>
                                ${!hasContact ? `
                                    <div style="color: #ef4444; font-size: 0.85rem; margin-top: 0.5rem;">
                                        Tài khoản chưa có đủ SĐT hoặc địa chỉ. Vui lòng chọn "Nhập địa chỉ giao hàng mới" hoặc <a href="/profile">cập nhật hồ sơ</a>.
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Fields for New Delivery Address -->
                            <div id="newAddressFields" style="display: ${!hasContact ? 'block' : 'none'}; margin-top: 1rem;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                    <div class="form-group">
                                        <label for="newRecipientName">Họ và tên người nhận (*)</label>
                                        <input type="text" id="newRecipientName" class="form-control" placeholder="Ví dụ: Nguyễn Văn B">
                                    </div>
                                    <div class="form-group">
                                        <label for="newRecipientPhone">Số điện thoại nhận hàng (*)</label>
                                        <input type="text" id="newRecipientPhone" class="form-control" placeholder="Ví dụ: 0988123456" maxlength="10">
                                    </div>
                                </div>
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="newRecipientAddress">Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP) (*)</label>
                                    <textarea id="newRecipientAddress" class="form-control" rows="2" placeholder="Ví dụ: Tòa nhà Landmark 81, Phường 22, Bình Thạnh, TP.HCM"></textarea>
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 1rem;">
                                <label for="orderNotes">Ghi chú đơn hàng (Tùy chọn)</label>
                                <input type="text" id="orderNotes" class="form-control" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến...">
                            </div>
                        </div>

                        <!-- 2. Payment Method Selection -->
                        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                            <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                2. Phương Thức Thanh Toán
                            </h3>

                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <!-- COD: Default -->
                                <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                    <input type="radio" name="payment_method" value="cod" checked>
                                    <div>
                                        <div style="font-weight: 700; color: #0f172a;">Tiền mặt khi nhận hàng (COD - Mặc định)</div>
                                        <div style="font-size: 0.8rem; color: #64748b;">Bạn kiểm tra hàng trước và thanh toán tiền mặt trực tiếp cho shipper.</div>
                                    </div>
                                </label>

                                <!-- Bank Transfer -->
                                <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                    <input type="radio" name="payment_method" value="bank_transfer">
                                    <div>
                                        <div style="font-weight: 700; color: #0f172a;">Chuyển khoản ngân hàng (Quét mã QR 24/7)</div>
                                        <div style="font-size: 0.8rem; color: #64748b;">Chuyển khoản qua số tài khoản cửa hàng, xác nhận tự động.</div>
                                    </div>
                                </label>

                                <!-- Bank transfer visual details -->
                                <div id="bankTransferInfo" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; font-size: 0.88rem;">
                                    <div style="font-weight: 700; color: #166534; margin-bottom: 0.5rem;">Thông tin tài khoản ngân hàng thụ hưởng:</div>
                                    <div>Ngân hàng: <strong>Vietcombank (Chi nhánh TP.HCM)</strong></div>
                                    <div>Số tài khoản: <strong>9999 8888 6666</strong></div>
                                    <div>Chủ tài khoản: <strong>CUA HANG DUNG CU AM NHAC MELODY</strong></div>
                                    <div style="font-size: 0.8rem; color: #15803d; margin-top: 0.5rem;">* Hệ thống sẽ tự động đối soát ngay sau khi nhận được chuyển khoản.</div>
                                </div>

                                <!-- Online Payment -->
                                <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                    <input type="radio" name="payment_method" value="online">
                                    <div>
                                        <div style="font-weight: 700; color: #0f172a;">Thanh toán trực tuyến (ATM Nội Địa / Visa / Mastercard)</div>
                                        <div style="font-size: 0.8rem; color: #64748b;">Cổng thanh toán thẻ an toàn bảo mật.</div>
                                    </div>
                                </label>

                                <div id="onlinePaymentInfo" style="display: none; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 1rem; font-size: 0.88rem;">
                                    <div style="color: #0369a1; font-weight: 600;">Môi trường thanh toán thẻ trực tuyến Sandbox: Đơn hàng sẽ được đánh dấu "Đã thanh toán" tự động sau khi đặt.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Order Summary -->
                    <div class="summary-card">
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem;">Kiểm Tra Đơn Hàng</h3>

                        <div id="checkoutItemsList" style="margin-bottom: 1rem; max-height: 260px; overflow-y: auto; padding-right: 0.5rem;">
                            <!-- Filled via JS -->
                        </div>

                        <div class="summary-row" style="border-top: 1px solid #e2e8f0; padding-top: 0.75rem;">
                            <span style="color: #64748b;">Vận chuyển:</span>
                            <span style="color: #16a34a; font-weight: 600;">Miễn phí</span>
                        </div>

                        <div class="summary-row total">
                            <span>Tổng tiền:</span>
                            <span id="checkoutTotal">0 ₫</span>
                        </div>

                        <button type="submit" class="btn-checkout" id="btnSubmitOrder">
                            <span>Xác nhận Đặt Hàng</span>
                        </button>

                        <div style="margin-top: 1.25rem;">
                            <a href="/cart" class="btn btn-secondary" style="width: 100%; justify-content: center;">&larr; Quay lại Giỏ hàng</a>
                        </div>
                    </div>
                </div>
            </form>
        `;
    },

    bindEvents() {
        const modeProfile = document.getElementById('addrModeProfile');
        const modeNew = document.getElementById('addrModeNew');
        const newAddrFields = document.getElementById('newAddressFields');
        const profileAddrPreview = document.getElementById('profileAddressPreview');

        if (modeProfile && modeNew) {
            const onModeChange = () => {
                if (modeProfile.checked) {
                    if (newAddrFields) newAddrFields.style.display = 'none';
                    if (profileAddrPreview) profileAddrPreview.style.display = 'block';
                } else {
                    if (newAddrFields) newAddrFields.style.display = 'block';
                    if (profileAddrPreview) profileAddrPreview.style.display = 'none';
                }
            };
            modeProfile.addEventListener('change', onModeChange);
            modeNew.addEventListener('change', onModeChange);
            this.listeners.push({ el: modeProfile, type: 'change', fn: onModeChange });
            this.listeners.push({ el: modeNew, type: 'change', fn: onModeChange });
        }

        const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
        const bankTransferInfo = document.getElementById('bankTransferInfo');
        const onlinePaymentInfo = document.getElementById('onlinePaymentInfo');

        paymentRadios.forEach(radio => {
            const onPayChange = () => {
                if (bankTransferInfo) bankTransferInfo.style.display = radio.value === 'bank_transfer' ? 'block' : 'none';
                if (onlinePaymentInfo) onlinePaymentInfo.style.display = radio.value === 'online' ? 'block' : 'none';
            };
            radio.addEventListener('change', onPayChange);
            this.listeners.push({ el: radio, type: 'change', fn: onPayChange });
        });

        const form = document.getElementById('checkoutForm');
        if (form) {
            const onSubmit = async (e) => {
                e.preventDefault();
                const addressMode = document.querySelector('input[name="address_mode"]:checked').value;
                const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
                const notes = document.getElementById('orderNotes').value.trim();

                const payload = {
                    address_mode: addressMode,
                    payment_method: paymentMethod,
                    notes: notes
                };

                if (addressMode === 'new') {
                    payload.recipient_name = document.getElementById('newRecipientName').value.trim();
                    payload.recipient_phone = document.getElementById('newRecipientPhone').value.trim();
                    payload.recipient_address = document.getElementById('newRecipientAddress').value.trim();

                    if (!payload.recipient_name || !payload.recipient_phone || !payload.recipient_address) {
                        showToast('Vui lòng điền đầy đủ họ tên, SĐT và địa chỉ giao hàng mới', 'error');
                        return;
                    }
                }

                try {
                    const res = await fetchAPI('/api/checkout', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    showToast('Đặt hàng thành công!', 'success');
                    if (window.updateCartBadge) window.updateCartBadge(0);
                    // SPA navigation to order success page
                    if (window.appRouter) {
                        window.appRouter.navigate(`/order-success/${res.order_code}`);
                    } else {
                        window.location.href = `/order-success/${res.order_code}`;
                    }
                } catch (err) {
                    showToast(err.message, 'error');
                }
            };
            form.addEventListener('submit', onSubmit);
            this.listeners.push({ el: form, type: 'submit', fn: onSubmit });
        }
    },

    async loadCheckoutSummary() {
        try {
            const res = await fetchAPI('/api/cart');
            if (!res.cart_items || res.cart_items.length === 0) {
                if (window.appRouter) {
                    window.appRouter.navigate('/cart');
                } else {
                    window.location.href = '/cart';
                }
                return;
            }

            const summaryList = document.getElementById('checkoutItemsList');
            if (summaryList) {
                summaryList.innerHTML = res.cart_items.map(item => `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.6rem; font-size: 0.9rem;">
                        <span>${this.escapeHtml(item.name)} <strong>&times; ${item.quantity}</strong></span>
                        <span style="font-weight:600;">${formatVND(item.subtotal)}</span>
                    </div>
                `).join('');
            }

            const totalEl = document.getElementById('checkoutTotal');
            if (totalEl) totalEl.textContent = formatVND(res.total_amount);
        } catch (e) {
            console.error(e);
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
