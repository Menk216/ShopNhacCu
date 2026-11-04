/**
 * Cart Page Module (SPA)
 */

export const CartModule = {
    container: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        document.title = 'Giỏ Hàng - Melody Store';

        this.renderShell();
        this.bindEvents();
        await this.loadCartData();
    },

    renderShell() {
        this.container.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Giỏ Hàng Của Bạn</h1>
                <p style="color: #64748b; font-size: 0.9rem;">Quản lý và kiểm tra các nhạc cụ bạn đã chọn trước khi tiến hành thanh toán</p>
            </div>

            <!-- Empty state -->
            <div id="cartEmptyState" style="display: none; text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-bottom: 0.5rem;">Giỏ hàng của bạn đang trống</h3>
                <p style="color: #64748b; margin-bottom: 1.5rem;">Hãy khám phá các mẫu nhạc cụ tuyệt vời tại Melody Store!</p>
                <a href="/" class="btn btn-primary">Khám phá nhạc cụ ngay</a>
            </div>

            <!-- Content layout -->
            <div id="cartContentLayout" class="cart-layout" style="display: none;">
                <!-- Items table -->
                <div class="cart-table-card">
                    <table class="table-custom">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="cartTableBody">
                            <!-- Loaded dynamically -->
                        </tbody>
                    </table>

                    <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <a href="/" class="btn btn-secondary">&larr; Tiếp tục chọn sản phẩm</a>
                    </div>
                </div>

                <!-- Summary & Proceed to Checkout -->
                <div class="summary-card">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem;">Tóm tắt đơn hàng</h3>
                    
                    <div class="summary-row">
                        <span style="color: #64748b;">Tạm tính:</span>
                        <span id="cartSubtotal" style="font-weight: 600;">0 ₫</span>
                    </div>

                    <div class="summary-row">
                        <span style="color: #64748b;">Phí vận chuyển:</span>
                        <span style="color: #16a34a; font-weight: 600;">Miễn phí toàn quốc</span>
                    </div>

                    <div class="summary-row total">
                        <span>Tổng cộng:</span>
                        <span id="cartTotal">0 ₫</span>
                    </div>

                    <a href="/checkout" class="btn-checkout">
                        Tiến hành đặt hàng &rarr;
                    </a>

                    <div style="margin-top: 1rem; font-size: 0.8rem; color: #64748b; text-align: center;">
                        Thanh toán an toàn & bảo mật
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const onTableClick = async (e) => {
            const qtyBtn = e.target.closest('.qty-btn[data-action]');
            if (qtyBtn) {
                const itemId = parseInt(qtyBtn.getAttribute('data-item-id'));
                const action = qtyBtn.getAttribute('data-action');
                const currQty = parseInt(qtyBtn.getAttribute('data-current-qty'));
                const newQty = action === 'plus' ? currQty + 1 : currQty - 1;
                await this.changeCartQty(itemId, newQty);
                return;
            }

            const removeBtn = e.target.closest('.btn-remove-item[data-item-id]');
            if (removeBtn) {
                const itemId = parseInt(removeBtn.getAttribute('data-item-id'));
                await this.removeCartItem(itemId);
                return;
            }
        };

        const tbody = document.getElementById('cartTableBody');
        if (tbody) {
            tbody.addEventListener('click', onTableClick);
            this.listeners.push({ el: tbody, type: 'click', fn: onTableClick });
        }
    },

    async loadCartData() {
        const tbody = document.getElementById('cartTableBody');
        const emptyState = document.getElementById('cartEmptyState');
        const contentLayout = document.getElementById('cartContentLayout');

        try {
            const res = await fetchAPI('/api/cart');
            if (!res.cart_items || res.cart_items.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                if (contentLayout) contentLayout.style.display = 'none';
                if (window.updateCartBadge) window.updateCartBadge(0);
                return;
            }

            if (emptyState) emptyState.style.display = 'none';
            if (contentLayout) contentLayout.style.display = 'grid';

            tbody.innerHTML = res.cart_items.map(item => `
                <tr>
                    <td style="display:flex; align-items:center; gap: 1rem;">
                        <img src="${item.image_url}" alt="${this.escapeHtml(item.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <div>
                            <a href="/product/${item.product_id}" style="font-weight: 600; font-size: 0.95rem; margin-bottom: 2px; color: #0f172a; text-decoration: none;">${this.escapeHtml(item.name)}</a>
                            <div style="font-size: 0.8rem; color: #64748b;">Mã: ${this.escapeHtml(item.code)} | Kho: ${item.stock_quantity}</div>
                        </div>
                    </td>
                    <td style="font-weight: 600;">${formatVND(item.unit_price)}</td>
                    <td>
                        <div class="qty-control">
                            <button class="qty-btn" data-action="minus" data-item-id="${item.cart_item_id}" data-current-qty="${item.quantity}">-</button>
                            <input class="qty-input" type="text" value="${item.quantity}" readonly>
                            <button class="qty-btn" data-action="plus" data-item-id="${item.cart_item_id}" data-current-qty="${item.quantity}">+</button>
                        </div>
                    </td>
                    <td style="font-weight: 700; color: #b45309;">${formatVND(item.subtotal)}</td>
                    <td>
                        <button class="btn-remove-item" data-item-id="${item.cart_item_id}" title="Xóa">&times;</button>
                    </td>
                </tr>
            `).join('');

            document.getElementById('cartSubtotal').textContent = formatVND(res.total_amount);
            document.getElementById('cartTotal').textContent = formatVND(res.total_amount);
            if (window.updateCartBadge) window.updateCartBadge(res.item_count);
        } catch (e) {
            console.error(e);
        }
    },

    async changeCartQty(cartItemId, newQty) {
        if (newQty <= 0) {
            if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
        }
        try {
            await fetchAPI('/api/cart/update', {
                method: 'PUT',
                body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQty })
            });
            await this.loadCartData();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async removeCartItem(cartItemId) {
        if (!confirm('Xác nhận xóa sản phẩm khỏi giỏ hàng?')) return;
        try {
            await fetchAPI('/api/cart/remove', {
                method: 'DELETE',
                body: JSON.stringify({ cart_item_id: cartItemId })
            });
            showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
            await this.loadCartData();
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
