/**
 * Admin SPA Router (History API)
 */

import { AdminDashboardModule } from './dashboard.js';
import { AdminUsersModule } from './users.js';
import { AdminCategoriesModule } from './categories.js';
import { AdminProductsModule } from './products.js';
import { AdminImportsModule } from './imports.js';
import { AdminPricingModule } from './pricing.js';
import { AdminOrdersModule } from './orders.js';
import { AdminInventoryModule } from './inventory.js';

class AdminSPARouter {
    constructor() {
        this.appContainer = null;
        this.currentModule = null;
        this.routes = [
            { pattern: /^\/admin\/?$/, module: AdminDashboardModule, targetPath: '/admin/dashboard' },
            { pattern: /^\/admin\/dashboard\/?$/, module: AdminDashboardModule },
            { pattern: /^\/admin\/users\/?$/, module: AdminUsersModule },
            { pattern: /^\/admin\/categories\/?$/, module: AdminCategoriesModule },
            { pattern: /^\/admin\/products\/?$/, module: AdminProductsModule },
            { pattern: /^\/admin\/imports\/?$/, module: AdminImportsModule },
            { pattern: /^\/admin\/pricing\/?$/, module: AdminPricingModule },
            { pattern: /^\/admin\/orders\/?$/, module: AdminOrdersModule },
            { pattern: /^\/admin\/inventory\/?$/, module: AdminInventoryModule }
        ];
    }

    init() {
        this.appContainer = document.getElementById('admin-app');
        if (!this.appContainer) return;

        // Browser Back / Forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname, new URLSearchParams(window.location.search), false);
        });

        // Intercept internal link clicks inside admin panel
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

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

            // Only intercept links within /admin/ (exclude /admin/login or customer links like /)
            if (!href.startsWith('/admin') || href.startsWith('/admin/login')) {
                return;
            }

            e.preventDefault();
            this.navigate(href);
        });

        // Initial route
        this.handleRoute(window.location.pathname, new URLSearchParams(window.location.search), false);
    }

    navigate(url) {
        if (!url) return;
        const parsedUrl = new URL(url, window.location.origin);
        const path = parsedUrl.pathname;
        const query = parsedUrl.searchParams;

        window.history.pushState({}, '', url);
        this.handleRoute(path, query, true);
    }

    async handleRoute(path, query, shouldScrollTop = true) {
        // Cleanup previous module
        if (this.currentModule && typeof this.currentModule.destroy === 'function') {
            try {
                this.currentModule.destroy();
            } catch (err) {
                console.error('Module destruction error:', err);
            }
            this.currentModule = null;
        }

        this.showLoading(true);

        // Update active class on sidebar navigation
        this.updateActiveSidebar(path);

        // Match route
        let matched = null;
        for (const r of this.routes) {
            if (r.pattern.test(path)) {
                matched = r;
                break;
            }
        }

        try {
            if (matched && matched.module) {
                this.currentModule = matched.module;
                await matched.module.mount(this.appContainer, {}, query);
            } else {
                this.renderNotFound(path);
            }
        } catch (error) {
            console.error('Admin routing error:', error);
            this.renderError(error);
        } finally {
            this.showLoading(false);
            if (shouldScrollTop) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    updateActiveSidebar(path) {
        const navLinks = document.querySelectorAll('.nav-item-admin');
        const normalizedPath = (path === '/admin' || path === '/admin/') ? '/admin/dashboard' : path.replace(/\/$/, '');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === normalizedPath || href === path)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    showLoading(show) {
        let loader = document.getElementById('adminLoadingBar');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'adminLoadingBar';
            loader.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:3px; background:linear-gradient(90deg, #d97706, #b45309, #d97706); z-index:9999; transition:opacity 0.2s; pointer-events:none;';
            document.body.appendChild(loader);
        }
        loader.style.display = show ? 'block' : 'none';
        loader.style.opacity = show ? '1' : '0';
    }

    renderNotFound(path) {
        document.title = '404 - Không Tìm Thấy Trang Quản Trị';
        const topTitle = document.getElementById('adminPageTitle');
        if (topTitle) topTitle.textContent = 'Trang Không Tồn Tại';

        this.appContainer.innerHTML = `
            <div style="text-align:center; padding:5rem 2rem; background:#fff; border-radius:12px; border:1px solid #e2e8f0; max-width:600px; margin:2rem auto;">
                <h1 style="font-size:3rem; font-weight:900; color:#d97706; margin-bottom:0.5rem;">404</h1>
                <h2 style="font-size:1.3rem; font-weight:700; color:#0f172a; margin-bottom:0.75rem;">Không Tìm Thấy Trang Quản Trị</h2>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:1.5rem;">Đường dẫn <code>${this.escapeHtml(path)}</code> không thuộc phân hệ quản trị.</p>
                <a href="/admin/dashboard" class="btn btn-primary">&larr; Quay về Bảng Điều Khiển Tổng Quan</a>
            </div>
        `;
    }

    renderError(error) {
        this.appContainer.innerHTML = `
            <div style="text-align:center; padding:4rem 2rem; background:#fff; border-radius:12px; border:1px solid #fee2e2; max-width:600px; margin:2rem auto;">
                <h2 style="font-size:1.3rem; font-weight:700; color:#dc2626; margin-bottom:0.75rem;">Đã Xảy Ra Lỗi</h2>
                <p style="color:#64748b; font-size:0.95rem; margin-bottom:1.5rem;">${this.escapeHtml(error.message || 'Không thể tải nội dung quản trị.')}</p>
                <a href="/admin/dashboard" class="btn btn-secondary">&larr; Quay về Tổng Quan</a>
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

window.adminRouter = new AdminSPARouter();
document.addEventListener('DOMContentLoaded', () => {
    window.adminRouter.init();
});
