/**
 * API Helper & Utility Functions
 */

function formatVND(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function formatDateOnly(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✔';
    if (type === 'error') icon = '✖';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong>${icon}</strong>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#94a3b8;">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

async function fetchAPI(url, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && data.require_login) {
                showToast(data.message || 'Vui lòng đăng nhập', 'warning');
                setTimeout(() => {
                    window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
                }, 1000);
                throw new Error(data.message);
            }
            if (response.status === 403 && data.require_admin) {
                showToast(data.message || 'Yêu cầu quyền Admin', 'error');
                setTimeout(() => {
                    window.location.href = '/admin/login';
                }, 1000);
                throw new Error(data.message);
            }
            throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
