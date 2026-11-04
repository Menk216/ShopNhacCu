/**
 * Admin Pricing & Profit Margin Management Page Module (SPA)
 */

export const AdminPricingModule = {
    container: null,
    listeners: [],

    async mount(container, params, query) {
        this.container = container;
        this.listeners = [];
        document.title = 'Quản Lý Giá Bán & % Lợi Nhuận - Melody Store Admin';

        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Quản Lý Giá Bán & Tỉ Lệ % Lợi Nhuận';

        this.renderShell();
        this.bindEvents();
        await this.loadPricingData();
    },

    renderShell() {
        this.container.innerHTML = `
            <div class="alert-banner alert-warning">
                <span><strong>Nguyên tắc định giá bán:</strong> Giá bán được tự động tính theo công thức: <code>Giá bán = Giá vốn &times; (1 + % Lợi nhuận / 100)</code>. Nếu sản phẩm có thiết lập % lợi nhuận riêng thì sẽ ưu tiên dùng % đó; nếu không sẽ kế thừa % lợi nhuận của loại sản phẩm.</span>
            </div>

            <!-- Section 1: Profit Margin by Category -->
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">1. Cài Đặt Tỉ Lệ % Lợi Nhuận Theo Loại Sản Phẩm</h3>
                </div>
                <div class="table-card">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width: 15%;">Mã loại</th>
                                <th style="width: 45%;">Tên loại sản phẩm</th>
                                <th style="width: 40%;">Tỉ lệ % lợi nhuận áp dụng</th>
                            </tr>
                        </thead>
                        <tbody id="pricingCategoriesTableBody">
                            <tr><td colspan="3" style="text-align:center; padding:1.5rem; color:#64748b;">Đang tải danh mục...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Section 2: Products Price Lookup & Individual Override -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">2. Tra Cứu & Điều Chỉnh Giá Vốn, % Lợi Nhuận, Giá Bán Từng Sản Phẩm</h3>
                </div>
                <div class="table-card">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Loại</th>
                                <th>Giá vốn (VNĐ)</th>
                                <th>% Lợi nhuận</th>
                                <th>Giá bán tính toán (VNĐ)</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="pricingProductsTableBody">
                            <tr><td colspan="7" style="text-align:center; padding:1.5rem; color:#64748b;">Đang tải danh sách sản phẩm...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const catTbody = document.getElementById('pricingCategoriesTableBody');
        if (catTbody) {
            const onCatClick = async (e) => {
                const saveBtn = e.target.closest('.btn-save-cat-margin[data-id]');
                if (saveBtn) {
                    const catId = parseInt(saveBtn.getAttribute('data-id'));
                    const input = document.getElementById(`catMargin_${catId}`);
                    if (!input) return;
                    const val = parseFloat(input.value);
                    await this.saveCategoryMargin(catId, val);
                }
            };
            catTbody.addEventListener('click', onCatClick);
            this.listeners.push({ el: catTbody, type: 'click', fn: onCatClick });
        }

        const prodTbody = document.getElementById('pricingProductsTableBody');
        if (prodTbody) {
            const onProdClick = async (e) => {
                const saveBtn = e.target.closest('.btn-save-prod-pricing[data-id]');
                if (saveBtn) {
                    const prodId = parseInt(saveBtn.getAttribute('data-id'));
                    const costInput = document.getElementById(`prodCost_${prodId}`);
                    const marginInput = document.getElementById(`prodMargin_${prodId}`);
                    const costVal = parseFloat(costInput?.value) || 0;
                    const marginVal = marginInput?.value.trim();

                    const payload = {
                        cost_price: costVal,
                        profit_margin_percent: marginVal !== '' ? parseFloat(marginVal) : null
                    };
                    await this.saveProductPricing(prodId, payload);
                }
            };
            prodTbody.addEventListener('click', onProdClick);
            this.listeners.push({ el: prodTbody, type: 'click', fn: onProdClick });
        }
    },

    async loadPricingData() {
        try {
            const res = await fetchAPI('/api/admin/pricing');
            
            // 1. Categories table
            const catTbody = document.getElementById('pricingCategoriesTableBody');
            if (catTbody) {
                catTbody.innerHTML = res.categories.map(c => `
                    <tr>
                        <td><strong>${this.escapeHtml(c.code)}</strong></td>
                        <td>${this.escapeHtml(c.name)}</td>
                        <td>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <input type="number" id="catMargin_${c.id}" class="form-control" style="width:90px;" min="0" step="0.5" value="${c.profit_margin_percent}">
                                <span>%</span>
                                <button class="btn btn-sm btn-primary btn-save-cat-margin" data-id="${c.id}">Lưu</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            // 2. Products table
            const prodTbody = document.getElementById('pricingProductsTableBody');
            if (prodTbody) {
                prodTbody.innerHTML = res.products.map(p => `
                    <tr>
                        <td><strong>${this.escapeHtml(p.code)}</strong></td>
                        <td>${this.escapeHtml(p.name)}</td>
                        <td>${this.escapeHtml(p.category_name)}</td>
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
                            <button class="btn btn-sm btn-primary btn-save-prod-pricing" data-id="${p.id}">Cập nhật</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    },

    async saveCategoryMargin(catId, marginVal) {
        try {
            const res = await fetchAPI(`/api/admin/pricing/category/${catId}`, {
                method: 'PUT',
                body: JSON.stringify({ profit_margin_percent: marginVal })
            });
            showToast(res.message, 'success');
            await this.loadPricingData();
        } catch (e) {
            showToast(e.message, 'error');
        }
    },

    async saveProductPricing(prodId, payload) {
        try {
            const res = await fetchAPI(`/api/admin/pricing/product/${prodId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast(res.message, 'success');
            await this.loadPricingData();
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
