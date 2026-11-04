/**
 * Order Success Page Module (SPA)
 */

export const OrderSuccessModule = {
    container: null,
    orderCode: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.orderCode = params.code;
        document.title = 'Đặt Hàng Thành Công - Melody Store';

        this.renderShell();
        await this.loadOrderData();
    },

    renderShell() {
        this.container.innerHTML = `
            <div style="max-width: 780px; margin: 2rem auto;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 56px; height: 56px; margin: 0 auto 1rem; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center; color: #16a34a; font-size: 1.8rem; font-weight: bold;">✓</div>
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #16a34a; margin-bottom: 0.5rem;">Đặt Hàng Thành Công!</h1>
                    <p style="color: #64748b; font-size: 1rem;">Cảm ơn quý khách đã mua sắm tại Melody Store. Đơn hàng của bạn đã được tiếp nhận và chuyển đến bộ phận xử lý.</p>
                </div>

                <!-- Order Review Card -->
                <div id="orderSuccessCard" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <div style="font-size: 0.85rem; color: #64748b;">MÃ ĐƠN HÀNG:</div>
                            <div style="font-size: 1.3rem; font-weight: 800; color: #0f172a;" id="successOrderCode">${this.escapeHtml(this.orderCode)}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.85rem; color: #64748b;">NGÀY ĐẶT:</div>
                            <div style="font-weight: 600;" id="successOrderDate">Đang tải...</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; font-size: 0.92rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.4rem;">Thông tin người nhận:</div>
                            <div>Họ và tên: <strong id="successRecipientName"></strong></div>
                            <div>Số điện thoại: <span id="successRecipientPhone"></span></div>
                            <div>Địa chỉ giao: <span id="successRecipientAddress"></span></div>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.4rem;">Chi tiết thanh toán & Vận chuyển:</div>
                            <div>Phương thức: <strong id="successPaymentMethod"></strong></div>
                            <div>Tình trạng thanh toán: <span id="successPaymentStatus" class="badge"></span></div>
                            <div>Ghi chú: <span id="successNotes"></span></div>
                        </div>
                    </div>

                    <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">Danh sách sản phẩm đã đặt:</h3>
                    <table class="table-custom" style="margin-bottom: 1.5rem;">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody id="successItemsBody">
                            <tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#64748b;">Đang tải danh sách sản phẩm...</td></tr>
                        </tbody>
                    </table>

                    <div style="text-align: right; border-top: 1px solid #e2e8f0; padding-top: 1rem; font-size: 1.35rem; font-weight: 800; color: #b45309;">
                        Tổng thanh toán: <span id="successTotalAmount">0 ₫</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
                    <a href="/orders" class="btn btn-secondary">Xem lịch sử đơn hàng</a>
                    <a href="/" class="btn btn-primary">Tiếp tục mua sắm</a>
                </div>
            </div>
        `;
    },

    async loadOrderData() {
        try {
            const res = await fetchAPI(`/api/orders/${this.orderCode}`);
            const o = res.order;

            const dateEl = document.getElementById('successOrderDate');
            if (dateEl) dateEl.textContent = formatDate(o.created_at);

            const nameEl = document.getElementById('successRecipientName');
            if (nameEl) nameEl.textContent = o.recipient_name;

            const phoneEl = document.getElementById('successRecipientPhone');
            if (phoneEl) phoneEl.textContent = o.recipient_phone;

            const addrEl = document.getElementById('successRecipientAddress');
            if (addrEl) addrEl.textContent = o.recipient_address;

            const notesEl = document.getElementById('successNotes');
            if (notesEl) notesEl.textContent = o.notes || 'Không có';

            const paymentMap = {
                'cod': 'Tiền mặt khi nhận hàng (COD)',
                'bank_transfer': 'Chuyển khoản ngân hàng',
                'online': 'Thanh toán trực tuyến'
            };
            const payMethodEl = document.getElementById('successPaymentMethod');
            if (payMethodEl) payMethodEl.textContent = paymentMap[o.payment_method] || o.payment_method;

            const payStatusEl = document.getElementById('successPaymentStatus');
            if (payStatusEl) {
                payStatusEl.textContent = o.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
                payStatusEl.className = `badge ${o.payment_status === 'paid' ? 'paid' : 'unpaid'}`;
            }

            const itemsBody = document.getElementById('successItemsBody');
            if (itemsBody) {
                itemsBody.innerHTML = o.items.map(it => `
                    <tr>
                        <td><strong>${this.escapeHtml(it.product_name)}</strong></td>
                        <td>${formatVND(it.unit_price)}</td>
                        <td>${it.quantity}</td>
                        <td style="font-weight:700; color:#b45309;">${formatVND(it.subtotal)}</td>
                    </tr>
                `).join('');
            }

            const totalEl = document.getElementById('successTotalAmount');
            if (totalEl) totalEl.textContent = formatVND(o.total_amount);

        } catch (e) {
            const card = document.getElementById('orderSuccessCard');
            if (card) {
                card.innerHTML = `<div style="color:red; text-align:center; padding:2rem;">Không tìm thấy thông tin đơn hàng: ${e.message}</div>`;
            }
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
