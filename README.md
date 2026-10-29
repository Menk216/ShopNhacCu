# Website Bán Dụng Cụ Âm Nhạc (Melody Store)

Dự án website thương mại điện tử chuyên kinh doanh nhạc cụ chính hãng (Guitar, Piano & Keyboard, Trống & Bộ gõ, Violin, Kèn & Sáo, Phụ kiện âm nhạc).
- **Backend:** Python (Flask RESTful API, SQLite)
- **Frontend:** HTML5, CSS3, JavaScript Thuần (Vanilla ES6+), Jinja2 Template Engine

---

## 1. Hướng dẫn chạy ứng dụng

### Cách 1: Chạy nhanh bằng file `run.bat` (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file **`run.bat`** trong thư mục dự án. Hệ thống sẽ tự động cài đặt thư viện cần thiết, khởi tạo cơ sở dữ liệu mẫu và bật máy chủ.

### Cách 2: Chạy bằng dòng lệnh (Terminal / Command Prompt)
```bash
# 1. Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# 2. Khởi tạo dữ liệu mẫu phong phú
python seed_data.py

# 3. Khởi chạy máy chủ
python app.py
```

Sau khi chạy, truy cập vào trình duyệt:
- **Trang Khách hàng (End-user):** [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Trang Quản trị (Admin):** [http://127.0.0.1:5000/admin/login](http://127.0.0.1:5000/admin/login)

---

## 2. Tài khoản mặc định hệ thống

| Phân hệ | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin tối cao (ID: 1)** | `admin` | `admin123` | Quản trị toàn quyền, được bảo vệ không thể bị khóa |
| **Khách hàng 1** | `khachhang1` | `123456` | Đã có sẵn lịch sử đơn hàng và địa chỉ |
| **Khách hàng 2** | `khachhang2` | `123456` | Tài khoản khách hàng thông thường |
| **Khách hàng bị khóa** | `khachhang_bi_khoa` | `123456` | Tài khoản thử nghiệm tính năng chặn đăng nhập |

---

## 3. Cấu trúc thư mục dự án

```text
DAWEB1/
├── app.py                      # Backend chính: Routing, API Endpoints, Xác thực & Nghiệp vụ
├── database.py                 # Schema SQLite (8 bảng), kết nối DB và công thức định giá
├── seed_data.py                # Script nạp dữ liệu mẫu ban đầu (nhạc cụ, danh mục, tài khoản)
├── music_store.db              # File cơ sở dữ liệu SQLite
├── requirements.txt            # Thư viện Flask, Werkzeug
├── run.bat                     # File chạy tự động 1-click trên Windows
│
├── static/                     # TÀI NGUYÊN FRONTEND
│   ├── css/
│   │   ├── style.css           # Toàn bộ CSS giao diện khách hàng (Layout, Grid, Responsive)
│   │   └── admin.css           # Toàn bộ CSS giao diện quản trị (Sidebar, Bảng, Toast, Modal)
│   └── js/
│       ├── api.js              # Hàm dùng chung: fetchAPI(), showToast(), formatVND(), formatDate()
│       ├── app.js              # JS logic khách hàng: xem SP, tìm kiếm, giỏ hàng, đặt hàng
│       └── admin.js            # JS logic quản trị: dashboard, kho, người dùng, giá, phiếu nhập
│
└── templates/                  # GIAO DIỆN HTML (Jinja2)
    ├── base.html               # Khung bố cục chung khách hàng (Header, Nav, Footer, Modal đơn)
    ├── index.html              # Trang chủ: Banner, Tìm kiếm nâng cao, Danh mục sản phẩm
    ├── product_detail.html     # Chi tiết nhạc cụ, chọn số lượng, thêm giỏ
    ├── cart.html               # Giỏ hàng: tăng/giảm số lượng, tính tổng tiền
    ├── checkout.html           # Đặt hàng: chọn địa chỉ, chọn phương thức thanh toán
    ├── orders.html             # Lịch sử đơn hàng, bộ lọc trạng thái, xem hóa đơn
    ├── order_success.html      # Trang thông báo đặt hàng thành công
    ├── login.html              # Trang đăng nhập / đăng ký khách hàng
    ├── profile.html            # Hồ sơ cá nhân và đổi mật khẩu khách
    └── admin/                  # CÁC TRANG QUẢN TRỊ
        ├── base_admin.html     # Khung bố cục admin (Sidebar, Topbar, Container)
        ├── login.html          # Đăng nhập admin giao diện sáng trang nhã
        ├── dashboard.html      # Thống kê doanh thu, đơn hàng, truy cập nhanh
        ├── users.html          # Quản lý tài khoản: đổi pass, khóa, xóa khách hàng
        ├── categories.html     # Quản lý loại nhạc cụ & % lãi mặc định
        ├── products.html       # Quản lý danh mục sản phẩm & nhập hàng nhanh
        ├── imports.html        # Quản lý phiếu nhập kho (Bản nháp -> Hoàn thành)
        ├── pricing.html        # Quản lý bảng giá & % lãi theo loại / riêng từng SP
        ├── orders.html         # Quản lý duyệt và cập nhật trạng thái đơn hàng
        └── inventory.html      # Tra cứu tồn kho tất cả mặt hàng & Báo cáo Nhập-Xuất-Tồn
```

---

## 4. Các tính năng nổi bật đã hoàn thành

### Phân hệ Quản trị (Admin)
1. **Bảo vệ tài khoản Root Admin:** Tài khoản `admin` (ID: 1) không thể bị khóa hoặc xóa từ giao diện lẫn API.
2. **Quản lý khách hàng toàn diện:** Xem danh sách, tìm kiếm đa năng, đổi mật khẩu, khóa/mở khóa tài khoản và **xóa vĩnh viễn tài khoản khách hàng** (kèm dọn dẹp đơn hàng/giỏ hàng liên quan).
3. **Quản lý Nhập hàng linh hoạt:**
   - Cho phép nhập hàng đối với **toàn bộ tất cả mặt hàng** (kể cả mặt hàng còn nhiều tồn kho) trực tiếp từ bảng tồn kho hoặc danh mục sản phẩm.
   - Cơ chế 2 bước an toàn: **Bản nháp** (tự do sửa/xóa) $\rightarrow$ **Hoàn thành** (chốt giá vốn, cộng dồn kho, khóa phiếu).
4. **Quản lý giá bán & % Lợi nhuận động:**
   $$\text{Giá bán} = \text{Giá vốn} \times \left(1 + \frac{\text{\% Lợi nhuận}}{100}\right)$$
   Ưu tiên dùng % lợi nhuận riêng của sản phẩm, nếu để trống tự động kế thừa % lợi nhuận của loại sản phẩm.
5. **Giao diện sáng & Tối ưu thông báo:**
   - Toàn bộ giao diện được chuẩn hóa, loại bỏ icon emoji rườm rà.
   - Trang đăng nhập quản trị nền sáng hiện đại, dễ nhìn.
   - Thông báo nổi (Toast Notification) tương phản cao với icon SVG chuẩn đồ họa.

### Phân hệ Khách hàng (Client)
1. **Tìm kiếm nâng cao kết hợp:** Tìm kiếm đồng thời theo Tên từ khóa + Phân loại danh mục + Khoảng giá (Từ giá - Đến giá) trong 1 lần bấm, có phân trang mượt mà.
2. **Quy trình mua sắm khép kín:** Thêm giỏ hàng $\rightarrow$ Tăng giảm số lượng $\rightarrow$ Đặt hàng (chọn địa chỉ mặc định hoặc nhập mới, chọn COD/Chuyển khoản/Thẻ) $\rightarrow$ Xem hóa đơn chi tiết $\rightarrow$ Mua lại đơn cũ.

---

# 🎓 CẨM NANG VẤN ĐÁP ĐỒ ÁN VỚI GIẢNG VIÊN (TẬP TRUNG FRONTEND)

> Tài liệu này tổng hợp toàn bộ các câu hỏi giảng viên hay hỏi nhất khi bảo vệ đồ án Web, giải thích cặn kẽ bản chất kỹ thuật phía Frontend để bạn tự tin đạt điểm tối đa!

---

## ❓ Câu 1: Em hãy giải thích mô hình kiến trúc Frontend của đồ án và mối quan hệ giữa HTML, CSS, JavaScript?

### 🎯 Trả lời:
Frontend đồ án được xây dựng theo mô hình **Client-Side Rendering kết hợp Server-Side Template (Jinja2)**:
1. **HTML (Bộ khung xương / Structure):** Định hình cấu trúc cây DOM (Document Object Model) cho trang web: tiêu đề, thanh điều hướng, bảng biểu dữ liệu, form nhập liệu và các hộp thoại modal. Dự án sử dụng thêm cú pháp **Jinja2** của Flask (`{% for %}`, `{{ variable }}`) để nhúng các dữ liệu khung từ máy chủ (như thông tin đăng nhập, danh mục menu).
2. **CSS (Lớp áo thẩm mỹ / Presentation):** Định kiểu giao diện:
   - Sử dụng **CSS Variables (`:root`)** để quản lý bảng màu đồng nhất (`--primary`, `--dark`, `--border`, `--success`...).
   - Bố cục hiện đại bằng **Flexbox** (căn chỉnh thanh điều hướng, nút bấm) và **CSS Grid** (dàn lưới sản phẩm, thẻ thống kê).
   - Thiết kế **Responsive** bằng Media Query thích ứng trên màn hình máy tính và thiết bị di động.
3. **JavaScript (Bộ não tương tác / Behavior):**
   - Lắng nghe các sự kiện người dùng (click nút mua, nhập tìm kiếm, submit form, mở modal).
   - Sử dụng **Fetch API / AJAX** gửi request bất đồng bộ lên Backend để lấy/ghi dữ liệu dạng **JSON**.
   - Thao tác trực tiếp trên cây DOM (DOM Manipulation) để cập nhật giao diện ngay lập tức mà **không cần reload (tải lại) toàn bộ trang web**.

---

## ❓ Câu 2: Tại sao đồ án không dùng React, Vue hay Angular mà lại dùng JavaScript thuần (Vanilla JS)?

### 🎯 Trả lời:
- **Nắm vững bản chất nền tảng:** Mục tiêu đồ án là hiểu sâu bản chất cốt lõi của Web Fundamentals: cách cây DOM vận hành, cơ chế Event Loop, cách trình duyệt gửi/nhận HTTP Request qua Fetch API mà không bị phụ thuộc vào sự trừu tượng hóa của framework.
- **Tối ưu hiệu năng:** Ứng dụng không cần qua các bước biên dịch (Webpack, Vite, Babel), không có Virtual DOM overhead, dung lượng file JS cực kỳ nhẹ (chỉ vài chục KB) giúp trang web tải tức thì.
- **Dễ bảo trì và triển khai:** Không bị lỗi xung đột phiên bản `node_modules`, có thể chạy trực tiếp trên bất kỳ máy chủ hay trình duyệt web nào.

---

## ❓ Câu 3: Em hãy giải thích hàm `fetchAPI()` trong file `static/js/api.js` hoạt động như thế nào?

### 🎯 Trả lời & Chỉ code:
Vị trí: [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js)

```javascript
async function fetchAPI(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra từ máy chủ');
    }
    return data;
}
```

### Điểm kỹ thuật cần giải thích cho giảng viên:
1. **Async / Await:** Hàm được khai báo `async` để xử lý các tác vụ bất đồng bộ một cách tuần tự, dễ đọc hơn cú pháp `Promise.then()`.
2. **Spread Operator (`...`):** Hợp nhất `defaultHeaders` với các header tùy biến mà lập trình viên truyền thêm vào.
3. **Error Handling tập trung:** Kiểm tra `response.ok` (HTTP status code trong dải 200–299). Nếu server trả về mã lỗi (400, 401, 403, 404, 500), hàm tự động ném ra `Error` kèm thông báo tiếng Việt từ máy chủ để các hàm gọi chỉ cần dùng `try...catch` bắt lỗi gọn gàng.

---

## ❓ Câu 4: Khi khách hàng bấm "Thêm vào giỏ hàng", code Frontend chạy thế nào từ đầu đến cuối?

### 🎯 Trả lời theo từng bước:
Vị trí: [static/js/app.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/app.js)

1. **Bước 1 - Bắt sự kiện:** Người dùng bấm nút "Thêm giỏ" trên giao diện, kích hoạt sự kiện `onclick="handleAddToCart(productId, 1)"`.
2. **Bước 2 - Gửi request:** Hàm gọi:
   ```javascript
   const res = await fetchAPI('/api/cart/add', {
       method: 'POST',
       body: JSON.stringify({ product_id: productId, quantity: qty })
   });
   ```
3. **Bước 3 - Xử lý phản hồi:**
   - Nếu chưa đăng nhập: Server trả về `require_login: true` $\rightarrow$ Frontend tự chuyển hướng sang `/login`.
   - Nếu thành công:
     - Gọi `showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success')` hiển thị thông báo góc màn hình.
     - Cập nhật con số trên biểu tượng giỏ hàng ở thanh Menu: `updateCartBadge(res.cart_count)`.
4. **Bước 4 - Thao tác DOM:** Hàm `updateCartBadge()` tìm thẻ `#cartBadgeCount`:
   ```javascript
   badge.textContent = count;
   badge.style.display = count > 0 ? 'inline-block' : 'none';
   ```

---

## ❓ Câu 5: Chức năng Tìm kiếm nâng cao kết hợp (Advanced Search) hoạt động như thế nào ở Frontend?

### 🎯 Trả lời & Chỉ code:
Vị trí: [templates/index.html](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/templates/index.html) và [static/js/app.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/app.js)

1. **Ngăn chặn reload trang mặc định:**
   ```javascript
   document.getElementById('advancedSearchForm').addEventListener('submit', (e) => {
       e.preventDefault(); // Ngăn trình duyệt reload trang
       loadProducts(1);    // Tải trang 1 với các điều kiện lọc
   });
   ```
2. **Thu thập dữ liệu từ các thẻ input:** Lấy giá trị từ `searchKeyword`, `searchCategory`, `searchMinPrice`, `searchMaxPrice`.
3. **Tạo Query String bằng URLSearchParams:**
   ```javascript
   const params = new URLSearchParams();
   if (q) params.append('q', q);
   if (catId) params.append('category_id', catId);
   if (minPrice) params.append('min_price', minPrice);
   if (maxPrice) params.append('max_price', maxPrice);
   params.append('page', page);
   ```
4. **Render giao diện bằng Template Literal (ES6):**
   Duyệt qua mảng `res.products` bằng `map()` để sinh chuỗi HTML và gán vào `container.innerHTML = html`. Không cần load lại trang web.

---

## ❓ Câu 6: Hệ thống thông báo nổi (Toast Notification) được thiết kế và hiển thị như thế nào?

### 🎯 Trả lời:
Vị trí: [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js) và [static/css/admin.css](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/css/admin.css)

1. **Tạo phần tử DOM động:**
   Khi gọi `showToast(message, type)`:
   - Kiểm tra container `#toastContainer`, nếu chưa có sẽ tự động tạo: `document.createElement('div')`.
   - Tạo thẻ con `.toast.success` hoặc `.toast.error` chứa icon vector SVG và nội dung thông báo.
2. **CSS Animation:** Áp dụng `@keyframes toastSlideIn`:
   ```css
   @keyframes toastSlideIn {
       from { transform: translateX(110%); opacity: 0; }
       to { transform: translateX(0); opacity: 1; }
   }
   ```
3. **Tự động hủy bộ nhớ (Auto Cleanup):**
   Sử dụng `setTimeout(() => toast.remove(), 4000)` để tự động giải phóng phần tử sau 4 giây, tránh rò rỉ bộ nhớ DOM (Memory Leak).

---

## ❓ Câu 7: Ở trang Quản trị người dùng, làm thế nào Frontend chặn không cho khóa tài khoản Admin ID: 1?

### 🎯 Trả lời:
Vị trí: [static/js/admin.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin.js)

1. **Tại thời điểm Render bảng (Template Literal):**
   ```javascript
   ${u.id !== 1 ? `
       <button class="btn btn-sm ${u.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}" 
               onclick="toggleUserLock(${u.id})">
           ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}
       </button>
   ` : ''}
   ```
   Nếu `u.id === 1`, hệ thống **hoàn toàn không sinh ra nút Khóa** trong mã HTML, chỉ hiển thị nút Đổi mật khẩu.
2. **Kiểm tra chặn tại hàm sự kiện:**
   Trong hàm `toggleUserLock(userId)` có điều kiện chặn:
   ```javascript
   if (userId === 1) {
       showToast('Không thể khóa tài khoản Quản trị viên tối cao (ID: 1)!', 'error');
       return;
   }
   ```
3. **Nguyên tắc bảo vệ 2 lớp:** Ngay cả khi người dùng cố tình can thiệp mở DevTools để gọi API, Backend Flask tại `app.py` cũng đã kiểm tra `if user_id == 1: return 400`.

---

## ❓ Câu 8: Validate dữ liệu ở Client (Frontend) và Server (Backend) khác nhau như thế nào? Tại sao cần cả hai?

### 🎯 Trả lời:
- **Client-Side Validation (Frontend):**
  - Dùng thuộc tính HTML5 (`required`, `type="email"`, `min="1"`) và kiểm tra điều kiện rỗng bằng JS trước khi fetch.
  - *Mục đích:* Phản hồi ngay lập tức cho người dùng, nâng cao trải nghiệm người dùng (UX), giảm tải các request không hợp lệ gửi lên server.
- **Server-Side Validation (Backend):**
  - Kiểm tra lại toàn bộ dữ liệu trong `app.py` (tồn tại username, độ dài mật khẩu, kiểu dữ liệu số, hàng tồn kho thực tế).
  - *Mục đích:* **Bảo mật tuyệt đối**. Vì hacker hoặc người dùng am hiểu công nghệ có thể dùng Postman, cURL hoặc tắt JavaScript ở trình duyệt để vượt qua Frontend.

---

## 🛠 BẢNG TRA CỨU "SỬA NHANH TẠI CHỖ" KHI GIẢNG VIÊN YÊU CẦU

Khi vấn đáp, giảng viên thường yêu cầu: *"Em hãy sửa dòng code này xem trang web thay đổi như thế nào?"*. Dưới đây là vị trí chính xác để bạn chỉnh sửa ngay lập tức:

| Giảng viên yêu cầu | Nơi cần mở file | Dòng mã cần chỉnh sửa |
|---|---|---|
| **Đổi màu chủ đạo website** | [static/css/style.css](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/css/style.css) | Sửa `--primary: #d97706;` ở đầu file thành mã màu khác (vd: `#2563eb` - xanh dương). |
| **Đổi số lượng sản phẩm mỗi trang** | [app.py](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/app.py) | Tìm `api_get_products`, sửa `limit = 8` thành `4` hoặc `12`. |
| **Đổi ngưỡng cảnh báo hết hàng** | [app.py](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/app.py) & [inventory.html](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/templates/admin/inventory.html) | Tìm số `5` trong `stock_quantity <= 5` đổi thành `10`. |
| **Thay đổi cách format tiền tệ** | [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js) | Tìm hàm `formatVND(amount)`, sửa ký hiệu `' ₫'` thành `' VNĐ'`. |
| **Đổi thời gian tự tắt thông báo** | [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js) | Tìm `setTimeout(..., 4000)`, đổi `4000` (4s) thành `2000` (2s) hoặc `6000` (6s). |
| **Thêm cột hiển thị thông tin bảng** | [templates/admin/](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/templates/admin/) & [admin.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin.js) | Thêm thẻ `<th>` trong file `.html` tương ứng và thêm `<td>${u.ten_thuoc_tinh}</td>` trong file `.js`. |
