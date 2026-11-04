/**
 * Customer SPA Router (History API)
 */

import { HomeModule } from './pages/home.js';
import { ProductModule } from './pages/product.js';
import { CartModule } from './pages/cart.js';
import { CheckoutModule } from './pages/checkout.js';
import { OrderSuccessModule } from './pages/order_success.js';
import { OrdersModule } from './pages/orders.js';
import { ProfileModule } from './pages/profile.js';

class SPARouter {
    constructor() {
        this.appContainer = null;
        this.currentModule = null;
        this.routes = [
            { pattern: /^\/$/, module: HomeModule },
            { pattern: /^\/product\/(\d+)$/, module: ProductModule, paramNames: ['id'] },
            { pattern: /^\/cart$/, module: CartModule },
            { pattern: /^\/checkout$/, module: CheckoutModule },
            { pattern: /^\/order-success\/([^/]+)$/, module: OrderSuccessModule, paramNames: ['code'] },
            { pattern: /^\/orders$/, module: OrdersModule },
            { pattern: /^\/profile$/, module: ProfileModule },
        ];
    }

    init() {
        this.appContainer = document.getElementById('app');
        if (!this.appContainer) return;

        // Listen to browser Back / Forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname, new URLSearchParams(window.location.search), false);
        });

        // Intercept internal link clicks
        document.body.addEventListener('click', (e) => {
            // Check if clicked element or parent is an <a> tag
            const link = e.target.closest('a');
            if (!link) return;

            // Check if link should be handled by SPA
            const href = link.getAttribute('href');
            if (!href) return;

            // Ignore external links, mailto, tel, anchor jumps, target="_blank", or download links
            if (
                href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('//') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:') ||
                link.getAttribute('target') === '_blank' ||
                link.hasAttribute('download') ||
                link.hasAttribute('data-native')
            ) {
                return;
            }

            // Exclude admin pages and login pages (they have their own shells)
            if (href.startsWith('/admin') || href.startsWith('/login') || href.startsWith('/register')) {
                return;
            }

            // Internal page anchor on current page (e.g., #productCatalogSection)
            if (href.startsWith('#')) {
                return;
            }

            e.preventDefault();
            this.navigate(href);
        });

        // Initialize first route from current location
        this.handleRoute(window.location.pathname, new URLSearchParams(window.location.search), false);
    }

    navigate(url) {
        if (!url) return;
        const parsedUrl = new URL(url, window.location.origin);
        const path = parsedUrl.pathname;
        const query = parsedUrl.searchParams;

        // Push state to browser history
        window.history.pushState({}, '', url);

        // Render matching route
        this.handleRoute(path, query, true);
    }

    async handleRoute(path, query, shouldScrollTop = true) {
        // Clean up previous module lifecycle
        if (this.currentModule && typeof this.currentModule.destroy === 'function') {
            try {
                this.currentModule.destroy();
            } catch (err) {
                console.error('Module destruction error:', err);
            }
            this.currentModule = null;
        }

        // Show loading indicator
        this.showLoading(true);

        // Find matching route
        let matched = null;
        let routeParams = {};

        for (const r of this.routes) {
            const match = path.match(r.pattern);
            if (match) {
                matched = r;
                if (r.paramNames && r.paramNames.length > 0) {
                    r.paramNames.forEach((name, idx) => {
                        routeParams[name] = match[idx + 1];
                    });
                }
                break;
            }
        }

        try {
            if (matched && matched.module) {
                this.currentModule = matched.module;
                await matched.module.mount(this.appContainer, routeParams, query);
            } else {
                this.renderNotFound(path);
            }
        } catch (error) {
            console.error('Routing execution error:', error);
            this.renderError(error);
        } finally {
            this.showLoading(false);
            if (shouldScrollTop) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    showLoading(show) {
        let loader = document.getElementById('appLoadingBar');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'appLoadingBar';
            loader.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:3px; background:linear-gradient(90deg, #d97706, #b45309, #d97706); z-index:9999; transition:opacity 0.2s; pointer-events:none;';
            document.body.appendChild(loader);
        }
        loader.style.display = show ? 'block' : 'none';
        loader.style.opacity = show ? '1' : '0';
    }

    renderNotFound(path) {
        document.title = '404 - Không Tìm Thấy Trang';
        this.appContainer.innerHTML = `
            <div style="text-align:center; padding:5rem 2rem; background:#fff; border-radius:12px; border:1px solid #e2e8f0; max-width:600px; margin:2rem auto;">
                <h1 style="font-size:3.5rem; font-weight:900; color:#d97706; margin-bottom:0.5rem;">404</h1>
                <h2 style="font-size:1.4rem; font-weight:700; color:#0f172a; margin-bottom:0.75rem;">Không Tìm Thấy Trang</h2>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:1.75rem;">Đường dẫn <code>${this.escapeHtml(path)}</code> không tồn tại hoặc đã được thay đổi.</p>
                <a href="/" class="btn btn-primary">&larr; Quay về Trang Chủ Melody Store</a>
            </div>
        `;
    }

    renderError(error) {
        this.appContainer.innerHTML = `
            <div style="text-align:center; padding:4rem 2rem; background:#fff; border-radius:12px; border:1px solid #fee2e2; max-width:600px; margin:2rem auto;">
                <h2 style="font-size:1.4rem; font-weight:700; color:#dc2626; margin-bottom:0.75rem;">Đã Xảy Ra Lỗi</h2>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:1.5rem;">${this.escapeHtml(error.message || 'Không thể tải nội dung trang.')}</p>
                <a href="/" class="btn btn-secondary">&larr; Quay về Trang Chủ</a>
            </div>
        `;
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }
}

// Instantiate and expose router globally
window.appRouter = new SPARouter();
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter.init();
});
