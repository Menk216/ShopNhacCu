/**
 * Home & Product Catalog Page Module (SPA)
 */

export const HomeModule = {
    filters: {
        page: 1,
        limit: 8,
        category_id: null,
        q: '',
        min_price: null,
        max_price: null,
        sort: 'newest'
    },
    container: null,
    listeners: [],

    mount(container, params, query) {
        this.container = container;
        this.listeners = [];

        // Parse query params from URL
        this.filters.category_id = query.get('category_id') ? parseInt(query.get('category_id')) : null;
        this.filters.q = query.get('q') || '';
        this.filters.page = query.get('page') ? parseInt(query.get('page')) : 1;
        this.filters.sort = query.get('sort') || 'newest';
        this.filters.min_price = query.get('min_price') ? parseFloat(query.get('min_price')) : null;
        this.filters.max_price = query.get('max_price') ? parseFloat(query.get('max_price')) : null;

        document.title = 'Melody Store - Thế Giới Nhạc Cụ & Âm Thanh Cao Cấp';

        // Render Page Layout Shell
        this.renderLayout();

        // Bind event listeners
        this.bindEvents();

        // Update active category in header sub-nav
        this.syncHeaderNav();

        // Fetch and display products
        this.fetchAndRenderProducts();
    },

    renderLayout() {
        const categories = window.__APP_INITIAL_STATE__?.navCategories || [];
        const catOptions = categories.map(c => 
            `<option value="${c.id}" ${this.filters.category_id === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        this.container.innerHTML = `
            <!-- Hero Banner -->
            <div class="hero-banner">
                <div class="hero-text">
                    <h1>Thế Giới Dụng Cụ Âm Nhạc Đỉnh Cao</h1>
                    <p>Khám phá bộ sưu tập Guitar, Piano, Trống, Violin và Phụ kiện âm nhạc chính hãng với chất âm tinh tế cùng chính sách hậu mãi chuyên nghiệp.</p>
                    <a href="#productCatalogSection" class="hero-btn">Khám phá ngay &darr;</a>
                </div>
                <div style="text-align: right; color: rgba(255,255,255,0.15); font-size: 4.5rem; font-weight: 900; letter-spacing: 2px; user-select: none;">
                    MELODY
                </div>
            </div>

            <!-- Advanced Search Box -->
            <section id="productCatalogSection" class="advanced-search-card">
                <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
                    Tìm Kiếm Nâng Cao Nhạc Cụ
                </h3>
                <form id="advancedSearchForm">
                    <div class="search-grid">
                        <div class="form-group">
                            <label for="searchKeyword">Tên sản phẩm / Từ khóa</label>
                            <input type="text" id="searchKeyword" class="form-control" placeholder="Ví dụ: Yamaha, Roland, Fender..." value="${this.escapeHtml(this.filters.q)}">
                        </div>
                        <div class="form-group">
                            <label for="searchCategory">Phân loại danh mục</label>
                            <select id="searchCategory" class="form-control">
                                <option value="">-- Tất cả phân loại --</option>
                                ${catOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="searchMinPrice">Giá từ (VNĐ)</label>
                            <input type="number" id="searchMinPrice" class="form-control" placeholder="0" min="0" step="50000" value="${this.filters.min_price || ''}">
                        </div>
                        <div class="form-group">
                            <label for="searchMaxPrice">Giá đến (VNĐ)</label>
                            <input type="number" id="searchMaxPrice" class="form-control" placeholder="Tối đa" min="0" step="50000" value="${this.filters.max_price || ''}">
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button type="submit" class="btn-search">
                                Tìm kiếm
                            </button>
                            <button type="button" id="btnResetSearch" class="btn-reset" title="Đặt lại bộ lọc">
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            <!-- Product Catalog Header -->
            <div class="section-header">
                <h2 id="catalogTitle" class="section-title">Tất cả nhạc cụ</h2>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <label for="sortSelect" style="font-size: 0.85rem; font-weight: 600; color: #64748b;">Sắp xếp:</label>
                    <select id="sortSelect" class="form-control" style="width: auto; padding: 0.4rem 0.8rem;">
                        <option value="newest" ${this.filters.sort === 'newest' ? 'selected' : ''}>Mới nhất</option>
                        <option value="price_asc" ${this.filters.sort === 'price_asc' ? 'selected' : ''}>Giá: Thấp đến Cao</option>
                        <option value="price_desc" ${this.filters.sort === 'price_desc' ? 'selected' : ''}>Giá: Cao đến Thấp</option>
                        <option value="name_asc" ${this.filters.sort === 'name_asc' ? 'selected' : ''}>Tên: A - Z</option>
                    </select>
                </div>
            </div>

            <!-- Product Grid Container -->
            <div id="productGrid" class="product-grid">
                <div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: #64748b;">Đang tải danh sách nhạc cụ...</div>
            </div>

            <!-- Pagination Container -->
            <div id="paginationWrap" class="pagination-wrap"></div>
        `;
    },

    bindEvents() {
        const searchForm = document.getElementById('advancedSearchForm');
        if (searchForm) {
            const onSearch = (e) => {
                e.preventDefault();
                this.filters.q = document.getElementById('searchKeyword').value.trim();
                const catVal = document.getElementById('searchCategory').value;
                this.filters.category_id = catVal ? parseInt(catVal) : null;
                const minP = document.getElementById('searchMinPrice').value;
                const maxP = document.getElementById('searchMaxPrice').value;
                this.filters.min_price = minP ? parseFloat(minP) : null;
                this.filters.max_price = maxP ? parseFloat(maxP) : null;
                this.filters.page = 1;

                this.syncUrl();
                this.syncHeaderNav();
                this.fetchAndRenderProducts();
            };
            searchForm.addEventListener('submit', onSearch);
            this.listeners.push({ el: searchForm, type: 'submit', fn: onSearch });
        }

        const resetBtn = document.getElementById('btnResetSearch');
        if (resetBtn) {
            const onReset = () => {
                this.filters = {
                    page: 1,
                    limit: 8,
                    category_id: null,
                    q: '',
                    min_price: null,
                    max_price: null,
                    sort: 'newest'
                };
                document.getElementById('searchKeyword').value = '';
                document.getElementById('searchCategory').value = '';
                document.getElementById('searchMinPrice').value = '';
                document.getElementById('searchMaxPrice').value = '';
                const quickInput = document.getElementById('quickSearchInput');
                if (quickInput) quickInput.value = '';

                this.syncUrl();
                this.syncHeaderNav();
                this.fetchAndRenderProducts();
            };
            resetBtn.addEventListener('click', onReset);
            this.listeners.push({ el: resetBtn, type: 'click', fn: onReset });
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            const onSort = () => {
                this.filters.sort = sortSelect.value;
                this.filters.page = 1;
                this.syncUrl();
                this.fetchAndRenderProducts();
            };
            sortSelect.addEventListener('change', onSort);
            this.listeners.push({ el: sortSelect, type: 'change', fn: onSort });
        }

        // Event delegation for Add to Cart and Pagination inside container
        const onContainerClick = (e) => {
            const addBtn = e.target.closest('.btn-add-cart');
            if (addBtn && !addBtn.disabled) {
                const prodId = addBtn.getAttribute('data-product-id');
                if (prodId) {
                    this.handleAddToCart(parseInt(prodId), 1);
                }
                return;
            }

            const pageBtn = e.target.closest('.page-btn[data-page]');
            if (pageBtn && !pageBtn.disabled) {
                const targetPage = parseInt(pageBtn.getAttribute('data-page'));
                if (targetPage && targetPage !== this.filters.page) {
                    this.goToPage(targetPage);
                }
                return;
            }
        };
        this.container.addEventListener('click', onContainerClick);
        this.listeners.push({ el: this.container, type: 'click', fn: onContainerClick });
    },

    syncUrl() {
        const params = new URLSearchParams();
        if (this.filters.category_id) params.set('category_id', this.filters.category_id);
        if (this.filters.q) params.set('q', this.filters.q);
        if (this.filters.page > 1) params.set('page', this.filters.page);
        if (this.filters.sort && this.filters.sort !== 'newest') params.set('sort', this.filters.sort);
        if (this.filters.min_price) params.set('min_price', this.filters.min_price);
        if (this.filters.max_price) params.set('max_price', this.filters.max_price);

        const qs = params.toString();
        const newUrl = qs ? `/?${qs}` : '/';
        window.history.pushState({}, '', newUrl);
    },

    syncHeaderNav() {
        const quickInput = document.getElementById('quickSearchInput');
        if (quickInput) quickInput.value = this.filters.q || '';

        document.querySelectorAll('.sub-nav-link').forEach(el => {
            const elCatId = el.getAttribute('data-category-id');
            if ((this.filters.category_id && elCatId === String(this.filters.category_id)) || (!this.filters.category_id && !elCatId)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    },

    async fetchAndRenderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: #64748b;">Đang tải danh sách nhạc cụ...</div>';

        let url = `/api/products?page=${this.filters.page}&limit=${this.filters.limit}`;
        if (this.filters.category_id) url += `&category_id=${this.filters.category_id}`;
        if (this.filters.q) url += `&q=${encodeURIComponent(this.filters.q)}`;
        if (this.filters.min_price) url += `&min_price=${this.filters.min_price}`;
        if (this.filters.max_price) url += `&max_price=${this.filters.max_price}`;
        if (this.filters.sort) url += `&sort=${this.filters.sort}`;

        try {
            const res = await fetchAPI(url);
            if (!res.products || res.products.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                        <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 1rem;">Không tìm thấy sản phẩm nhạc cụ nào phù hợp với yêu cầu.</p>
                        <button class="btn btn-secondary" id="btnEmptyReset">Xóa bộ lọc & Xem tất cả</button>
                    </div>
                `;
                const emptyReset = document.getElementById('btnEmptyReset');
                if (emptyReset) {
                    emptyReset.onclick = () => {
                        const resetBtn = document.getElementById('btnResetSearch');
                        if (resetBtn) resetBtn.click();
                    };
                }
                this.renderPagination(0, 1, 1);
                return;
            }

            grid.innerHTML = res.products.map(p => this.renderProductCard(p)).join('');
            this.renderPagination(res.pagination.total_items, res.pagination.total_pages, res.pagination.current_page);

            const titleEl = document.getElementById('catalogTitle');
            if (titleEl) {
                if (this.filters.q) {
                    titleEl.textContent = `Kết quả tìm kiếm cho: "${this.filters.q}" (${res.pagination.total_items} sản phẩm)`;
                } else if (this.filters.category_id) {
                    const activeLink = document.querySelector(`.sub-nav-link[data-category-id="${this.filters.category_id}"]`);
                    const catName = res.products[0]?.category_name || (activeLink ? activeLink.textContent.trim() : 'Danh mục');
                    titleEl.textContent = `${catName} (${res.pagination.total_items} sản phẩm)`;
                } else {
                    titleEl.textContent = `Tất cả nhạc cụ (${res.pagination.total_items} sản phẩm)`;
                }
            }
        } catch (e) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #ef4444;">Lỗi tải dữ liệu: ${e.message}</div>`;
        }
    },

    renderProductCard(p) {
        let stockBadge = '<span class="stock-tag in-stock">Còn hàng</span>';
        let isOutOfStock = false;
        if (p.stock_quantity <= 0) {
            stockBadge = '<span class="stock-tag out-of-stock">Hết hàng</span>';
            isOutOfStock = true;
        } else if (p.stock_quantity <= 5) {
            stockBadge = `<span class="stock-tag low-stock">Chỉ còn ${p.stock_quantity}</span>`;
        }

        return `
            <div class="product-card">
                <div class="product-thumb-wrap">
                    <img class="product-thumb" src="${p.image_url}" alt="${this.escapeHtml(p.name)}" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'">
                    ${stockBadge}
                </div>
                <div class="product-body">
                    <span class="product-category-name">${this.escapeHtml(p.category_name)}</span>
                    <a href="/product/${p.id}" class="product-title" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</a>
                    <div class="product-price-row">
                        <span class="product-price">${formatVND(p.selling_price)}</span>
                        <button class="btn-add-cart" data-product-id="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Hết hàng' : 'Thêm giỏ'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderPagination(totalItems, totalPages, currentPage) {
        const wrap = document.getElementById('paginationWrap');
        if (!wrap) return;

        if (totalPages <= 1) {
            wrap.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Trước</button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<span style="padding: 0 4px; color: #94a3b8;">...</span>`;
            }
        }

        html += `
            <button class="page-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Sau &raquo;</button>
        `;

        wrap.innerHTML = html;
    },

    goToPage(page) {
        this.filters.page = page;
        this.syncUrl();
        this.fetchAndRenderProducts();
        const catalogSec = document.getElementById('productCatalogSection');
        if (catalogSec) {
            catalogSec.scrollIntoView({ behavior: 'smooth' });
        }
    },

    async handleAddToCart(productId, quantity = 1) {
        try {
            const res = await fetchAPI('/api/cart/add', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId, quantity })
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
