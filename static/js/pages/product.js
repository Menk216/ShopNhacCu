/**
 * Product Detail Page Module (SPA)
 */

export const ProductModule = {
    container: null,
    productId: null,
    currentProduct: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        this.productId = params.id;
        this.currentProduct = null;

        this.container.innerHTML = `
            <div id="productDetailContainer" style="max-width: 1050px; margin: 1rem auto;">
                <div style="text-align: center; padding: 4rem; color: #64748b;">Đang tải thông tin nhạc cụ...</div>
            </div>
        `;

        try {
            const res = await fetchAPI(`/api/products/${this.productId}`);
            this.currentProduct = res.product;
            this.render();
            this.bindEvents();
            document.title = `${this.currentProduct.name} - Melody Store`;
        } catch (e) {
            this.container.innerHTML = `
                <div id="productDetailContainer" style="max-width: 1050px; margin: 1rem auto;">
                    <div style="text-align:center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <h3 style="color: #ef4444;">Không tìm thấy sản phẩm!</h3>
                        <p style="color: #64748b; margin: 1rem 0;">${e.message}</p>
                        <a href="/" class="btn btn-primary">&larr; Quay về trang chủ</a>
                    </div>
                </div>
            `;
        }
    },

    render() {
        const p = this.currentProduct;
        let stockHtml = `<strong style="color: #16a34a;">Còn hàng (${p.stock_quantity} sản phẩm có sẵn)</strong>`;
        let isOutOfStock = false;
        if (p.stock_quantity <= 0) {
            stockHtml = '<strong style="color: #ef4444;">Hết hàng</strong>';
            isOutOfStock = true;
        } else if (p.stock_quantity <= 5) {
            stockHtml = `<strong style="color: #d97706;">Sắp hết hàng (Chỉ còn ${p.stock_quantity} cái)</strong>`;
        }

        this.container.innerHTML = `
            <div id="productDetailContainer" style="max-width: 1050px; margin: 1rem auto;">
                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
                    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 2.5rem; align-items: start;">
                        <!-- Left: Image -->
                        <div>
                            <div style="width: 100%; height: 380px; border-radius: 10px; overflow: hidden; background: #f8fafc; border: 1px solid #e2e8f0;">
                                <img id="detailImg" src="${p.image_url}" alt="${this.escapeHtml(p.name)}" 
                                     onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'" 
                                     style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                        </div>

                        <!-- Right: Info -->
                        <div>
                            <div id="detailCategory" style="font-size: 0.85rem; font-weight: 700; color: #d97706; text-transform: uppercase; margin-bottom: 0.5rem;">
                                ${this.escapeHtml(p.category_name)}
                            </div>
                            <h1 id="detailName" style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.25;">
                                ${this.escapeHtml(p.name)}
                            </h1>
                            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 1.25rem;">
                                Mã sản phẩm: <strong id="detailCode" style="color: #0f172a;">${this.escapeHtml(p.code)}</strong> | Tình trạng: <span id="detailStockStatus">${stockHtml}</span>
                            </div>

                            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
                                <div style="font-size: 0.85rem; color: #92400e; font-weight: 600; margin-bottom: 0.25rem;">GIÁ BÁN CHÍNH HÃNG:</div>
                                <div id="detailPrice" style="font-size: 2rem; font-weight: 800; color: #b45309;">
                                    ${formatVND(p.selling_price)}
                                </div>
                            </div>

                            <div style="margin-bottom: 1.75rem;">
                                <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Mô tả & Thông số chi tiết:</h3>
                                <p id="detailDesc" style="color: #475569; font-size: 0.95rem; line-height: 1.7; white-space: pre-line;">
                                    ${this.escapeHtml(p.description || 'Chưa có mô tả chi tiết cho sản phẩm này.')}
                                </p>
                            </div>

                            <div style="display: flex; align-items: center; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
                                <div class="qty-control" style="height: 42px;">
                                    <button id="btnQtyMinus" class="qty-btn" style="width: 38px; height: 100%;">-</button>
                                    <input id="detailQuantity" class="qty-input" style="width: 50px; height: 100%;" type="text" value="1" readonly>
                                    <button id="btnQtyPlus" class="qty-btn" style="width: 38px; height: 100%;">+</button>
                                </div>

                                <button id="detailAddToCartBtn" class="btn-checkout" style="margin-top: 0; flex: 1; height: 42px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; ${isOutOfStock ? 'background:#cbd5e1; cursor:not-allowed;' : ''}" ${isOutOfStock ? 'disabled' : ''}>
                                    ${isOutOfStock ? 'Hết hàng tạm thời' : 'Thêm vào giỏ hàng'}
                                </button>
                            </div>

                            <div style="margin-top: 1.5rem; font-size: 0.85rem; color: #64748b; display: flex; gap: 1.5rem; flex-wrap: wrap;">
                                <span>✓ Bảo hành chính hãng 12 tháng</span>
                                <span>✓ Giao hàng toàn quốc</span>
                                <span>✓ Đổi trả trong 7 ngày</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem;">
                    <a href="/" class="btn btn-secondary">&larr; Tiếp tục xem nhạc cụ khác</a>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const minusBtn = document.getElementById('btnQtyMinus');
        const plusBtn = document.getElementById('btnQtyPlus');
        const qtyInput = document.getElementById('detailQuantity');
        const addBtn = document.getElementById('detailAddToCartBtn');

        if (minusBtn && qtyInput) {
            const onMinus = () => {
                let val = parseInt(qtyInput.value) - 1;
                if (val < 1) val = 1;
                qtyInput.value = val;
            };
            minusBtn.addEventListener('click', onMinus);
            this.listeners.push({ el: minusBtn, type: 'click', fn: onMinus });
        }

        if (plusBtn && qtyInput) {
            const onPlus = () => {
                let val = parseInt(qtyInput.value) + 1;
                if (this.currentProduct && val > this.currentProduct.stock_quantity) {
                    val = this.currentProduct.stock_quantity;
                    showToast(`Chỉ còn ${this.currentProduct.stock_quantity} sản phẩm trong kho`, 'warning');
                }
                qtyInput.value = val;
            };
            plusBtn.addEventListener('click', onPlus);
            this.listeners.push({ el: plusBtn, type: 'click', fn: onPlus });
        }

        if (addBtn) {
            const onAdd = async () => {
                if (!this.currentProduct || this.currentProduct.stock_quantity <= 0) return;
                const qty = parseInt(qtyInput.value) || 1;
                try {
                    const res = await fetchAPI('/api/cart/add', {
                        method: 'POST',
                        body: JSON.stringify({ product_id: this.currentProduct.id, quantity: qty })
                    });
                    showToast(res.message, 'success');
                    if (window.updateCartBadge) {
                        window.updateCartBadge(res.total_count);
                    }
                } catch (err) {
                    if (!err.message.includes('đăng nhập')) {
                        showToast(err.message, 'error');
                    }
                }
            };
            addBtn.addEventListener('click', onAdd);
            this.listeners.push({ el: addBtn, type: 'click', fn: onAdd });
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
