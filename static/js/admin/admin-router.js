/**
 * BỘ ĐIỀU HƯỚNG SPA QUẢN TRỊ (ADMIN CLIENT ROUTER)
 * Quản lý chuyển đổi các trang quản trị không tải lại trình duyệt.
 */

import { AdminDashboardModule } from './dashboard.js';
import { AdminUsersModule } from './users.js';
import { AdminCategoriesModule } from './categories.js';
import { AdminProductsModule } from './products.js';
import { AdminImportsModule } from './imports.js';
import { AdminPricingModule } from './pricing.js';
import { AdminOrdersModule } from './orders.js';
import { AdminInventoryModule } from './inventory.js';

// Vùng hiển thị nội dung chính của trang quản trị (<main id="admin-app">)
let adminContainer = null;

// Lưu trữ module quản trị đang hoạt động
let currentAdminModule = null;

// Hàm khởi tạo router quản trị
function initAdminRouter() {
    adminContainer = document.getElementById('admin-app');
    if (!adminContainer) return;

    // 1. Lắng nghe nút Back / Forward của trình duyệt
    window.addEventListener('popstate', function() {
        let path = window.location.pathname;
        let query = new URLSearchParams(window.location.search);
        handleAdminRoute(path, query, false);
    });

    // 2. Chặn các cú nhấp chuột vào link quản trị trong sidebar và topbar
    document.body.addEventListener('click', function(event) {
        let link = event.target.closest('a');
        if (!link) return;

        let href = link.getAttribute('href');
        if (!href) return;

        // Bỏ qua link ngoài hoặc link mở tab mới
        if (
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('//') ||
            link.getAttribute('target') === '_blank'
        ) {
            return;
        }

        // Chỉ chặn các link thuộc phân hệ quản trị /admin/ (ngoại trừ /admin/login)
        if (!href.startsWith('/admin') || href.startsWith('/admin/login')) {
            return;
        }

        // Ngăn tải lại trang
        event.preventDefault();

        // Chuyển trang quản trị mượt mà
        navigateAdmin(href);
    });

    // 3. Khởi tạo trang ban đầu
    let currentPath = window.location.pathname;
    let currentQuery = new URLSearchParams(window.location.search);
    handleAdminRoute(currentPath, currentQuery, false);
}

// Hàm chuyển trang quản trị không reload
function navigateAdmin(url) {
    if (!url) return;

    window.history.pushState({}, '', url);

    let parsedUrl = new URL(url, window.location.origin);
    let path = parsedUrl.pathname;
    let query = parsedUrl.searchParams;

    handleAdminRoute(path, query, true);
}

// Hàm xử lý hiển thị module trang quản trị tương ứng
async function handleAdminRoute(path, query, shouldScrollTop = true) {
    // 1. Dọn dẹp module trang cũ
    if (currentAdminModule && typeof currentAdminModule.destroy === 'function') {
        try {
            currentAdminModule.destroy();
        } catch (err) {
            console.error('Lỗi khi dọn dẹp module quản trị cũ:', err);
        }
        currentAdminModule = null;
    }

    // 2. Bật thanh tiến trình
    showAdminLoadingBar(true);

    // 3. Cập nhật trạng thái sáng (active) cho menu bên trái
    updateActiveSidebar(path);

    try {
        // 4. Khớp đường dẫn URL với Module quản trị bằng if / else if cơ bản
        if (path === '/admin' || path === '/admin/' || path === '/admin/dashboard') {
            currentAdminModule = AdminDashboardModule;
            await AdminDashboardModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/users') {
            currentAdminModule = AdminUsersModule;
            await AdminUsersModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/categories') {
            currentAdminModule = AdminCategoriesModule;
            await AdminCategoriesModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/products') {
            currentAdminModule = AdminProductsModule;
            await AdminProductsModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/imports') {
            currentAdminModule = AdminImportsModule;
            await AdminImportsModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/pricing') {
            currentAdminModule = AdminPricingModule;
            await AdminPricingModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/orders') {
            currentAdminModule = AdminOrdersModule;
            await AdminOrdersModule.mount(adminContainer, {}, query);

        } else if (path === '/admin/inventory') {
            currentAdminModule = AdminInventoryModule;
            await AdminInventoryModule.mount(adminContainer, {}, query);

        } else {
            renderAdminNotFound(path);
        }

    } catch (error) {
        console.error('Lỗi thực thi trang quản trị:', error);
        renderAdminError(error);
    } finally {
        showAdminLoadingBar(false);
        if (shouldScrollTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

// Cập nhật lớp active cho mục menu ở Sidebar
function updateActiveSidebar(currentPath) {
    let normalized = currentPath;
    if (normalized === '/admin' || normalized === '/admin/') {
        normalized = '/admin/dashboard';
    }

    let navLinks = document.querySelectorAll('.sidebar-nav .nav-item-admin');
    for (let i = 0; i < navLinks.length; i++) {
        let link = navLinks[i];
        let href = link.getAttribute('href');
        if (href === normalized) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    }
}

// Hiển thị thanh tiến trình tải trang phía trên cùng
function showAdminLoadingBar(show) {
    let loader = document.getElementById('adminLoadingBar');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'adminLoadingBar';
        loader.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:3px; background:linear-gradient(90deg, #d97706, #f59e0b); z-index:9999; pointer-events:none;';
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'block' : 'none';
}

// Giao diện khi không tìm thấy trang quản trị
function renderAdminNotFound(path) {
    document.title = '404 - Không Tìm Thấy Trang Quản Trị';
    adminContainer.innerHTML = `
        <div style="text-align:center; padding:4rem 2rem; background:#fff; border-radius:12px; border:1px solid #e2e8f0; max-width:600px; margin:2rem auto;">
            <h1 style="font-size:3.5rem; font-weight:900; color:#d97706; margin-bottom:0.5rem;">404</h1>
            <h2 style="font-size:1.3rem; font-weight:700; color:#0f172a; margin-bottom:0.75rem;">Mục Quản Trị Không Tồn Tại</h2>
            <p style="color:#64748b; margin-bottom:1.5rem;">Đường dẫn <code>${escapeHtml(path)}</code> không có trong hệ thống quản lý.</p>
            <a href="/admin/dashboard" class="btn btn-primary">&larr; Về Trang Bảng Điều Khiển</a>
        </div>
    `;
}

// Giao diện khi xảy ra lỗi tải trang quản trị
function renderAdminError(error) {
    adminContainer.innerHTML = `
        <div style="text-align:center; padding:3rem 2rem; background:#fff; border-radius:12px; border:1px solid #fee2e2; max-width:600px; margin:2rem auto;">
            <h3 style="font-size:1.25rem; font-weight:700; color:#dc2626; margin-bottom:0.75rem;">Lỗi Tải Dữ Liệu Quản Trị</h3>
            <p style="color:#64748b; margin-bottom:1.5rem;">${escapeHtml(error.message || 'Không thể nạp dữ liệu.')}</p>
            <a href="/admin/dashboard" class="btn btn-secondary">&larr; Tải lại Dashboard</a>
        </div>
    `;
}

// Đối tượng Router quản trị
export const adminRouter = {
    init: initAdminRouter,
    navigate: navigateAdmin,
    handleRoute: handleAdminRoute
};

window.adminRouter = adminRouter;

// Tự khởi động router khi trang admin.html đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    initAdminRouter();
});
