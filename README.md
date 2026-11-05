# Website Bán Dụng Cụ Âm Nhạc (Melody Store) - SPA Architecture

Dự án website thương mại điện tử chuyên kinh doanh nhạc cụ chính hãng (Guitar, Piano & Keyboard, Trống & Bộ gõ, Violin, Kèn & Sáo, Phụ kiện âm nhạc).
- **🌐 Website trực tuyến (Live Demo):** [https://shopnhaccu.onrender.com](https://shopnhaccu.onrender.com)
- **📦 Mã nguồn GitHub:** [https://github.com/Menk216/ShopNhacCu](https://github.com/Menk216/ShopNhacCu)
- **⚙️ Backend:** Python (Flask RESTful API, SQLite 3, Gunicorn)
- **🎨 Frontend:** Single Page Application (SPA) xây dựng bằng HTML5, CSS3, JavaScript Thuần (Vanilla ES6+ Modules, History API Router).

---

## 1. Hướng dẫn chạy ứng dụng

### Cách 1: Chạy nhanh bằng file `run.bat` (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file **`run.bat`** trong thư mục dự án. Hệ thống sẽ tự động cài đặt thư viện cần thiết, khởi tạo cơ sở dữ liệu mẫu và bật máy chủ.

### Cách 2: Chạy bằng dòng lệnh (Terminal / Command Prompt)
```bash
# 1. Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# 2. Khởi tạo dữ liệu mẫu (nếu database chưa có dữ liệu)
python seed_data.py

# 3. Khởi chạy máy chủ Flask
python app.py
```

Sau khi chạy, truy cập vào trình duyệt:
- **Trang Khách hàng (SPA Client):** [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Trang Quản trị (SPA Admin):** [http://127.0.0.1:5000/admin/login](http://127.0.0.1:5000/admin/login)

---

## 2. Tài khoản mặc định hệ thống

| Phân hệ | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin tối cao (ID: 1)** | `admin` | `admin123` | Quản trị toàn quyền, được bảo vệ không thể bị khóa hoặc xóa |
| **Khách hàng mẫu** | `1` | `123456` | Tài khoản khách hàng có sẵn trong cơ sở dữ liệu |

---

## 3. Cấu trúc thư mục dự án (Kiến trúc SPA Chuẩn)

```text
ShopNhacCu/
├── app.py                      # Backend: Flask RESTful APIs, Session Auth, Routing Application Shells
├── database.py                 # Schema SQLite (8 bảng), kết nối DB & công thức định giá bán
├── seed_data.py                # Script nạp dữ liệu mẫu ban đầu (danh mục, nhạc cụ, tài khoản)
├── music_store.db              # File cơ sở dữ liệu SQLite
├── requirements.txt            # Thư viện: Flask, Werkzeug
├── run.bat                     # File chạy tự động 1-click trên Windows
│
├── static/                     # TÀI NGUYÊN FRONTEND
│   ├── css/
│   │   ├── style.css           # CSS chung giao diện khách hàng (Layout, Grid, Responsive, Card)
│   │   ├── admin.css           # CSS giao diện quản trị (Sidebar, Topbar, Table, Form quản trị)
│   │   ├── login.css           # CSS giao diện đăng nhập / đăng ký khách hàng & quản trị
│   │   └── components.css      # CSS thành phần dùng chung (Modal, Toast, Error page, Utility classes)
│   └── js/
│       ├── api.js              # Hàm tiện ích chung: fetchAPI(), showToast(), formatVND(), formatDate()
│       ├── router.js           # SPA Router khách hàng (History API: pushState, popstate, Module Lifecycle)
│       ├── pages/              # CÁC MODULE CHỨC NĂNG KHÁCH HÀNG (ES6 Modules)
│       │   ├── home.js         # Trang chủ, tìm kiếm nâng cao đa tiêu chí, sắp xếp, phân trang, thêm giỏ
│       │   ├── product.js      # Chi tiết sản phẩm, chọn số lượng, kiểm tra tồn kho, thêm vào giỏ
│       │   ├── cart.js         # Giỏ hàng, tăng/giảm số lượng (+/-), xóa sản phẩm, tính tiền real-time
│       │   ├── checkout.js     # Đặt hàng, địa chỉ mặc định/mới, hình thức COD/Chuyển khoản QR/Thẻ
│       │   ├── order_success.js# Thông báo đặt hàng thành công, hiển thị tóm tắt đơn và mã đơn hàng
│       │   ├── orders.js       # Lịch sử đơn hàng, lọc theo trạng thái, thanh tiến trình, mua lại đơn cũ
│       │   └── profile.js      # Hồ sơ cá nhân, cập nhật SĐT, địa chỉ nhận hàng và đổi mật khẩu
│       │
│       └── admin/              # CÁC MODULE CHỨC NĂNG QUẢN TRỊ (ES6 Modules)
│           ├── admin-router.js # SPA Router quản trị (History API, Active Nav Highlighter, Loading Bar)
│           ├── dashboard.js    # Bảng điều khiển: Doanh thu, Đơn hàng, Tồn kho cảnh báo, Đơn mới nhất
│           ├── users.js        # Quản lý tài khoản: Thêm Admin mới, Đổi mật khẩu, Khóa/Mở khóa, Xóa khách
│           ├── categories.js   # Quản lý loại sản phẩm, % lợi nhuận định mức theo loại, ẩn/hiển thị
│           ├── products.js     # Quản lý danh mục sản phẩm, bộ lọc loại/tên, thêm/sửa modal, ẩn/hiện/xóa
│           ├── imports.js      # Quản lý nhập kho (Tạo/Sửa phiếu nháp nhiều mặt hàng -> Hoàn thành chốt kho)
│           ├── pricing.js      # Bảng giá & % Lãi: Cài đặt theo loại hoặc tùy chỉnh riêng từng sản phẩm
│           ├── orders.js       # Quản lý đơn hàng: Tìm kiếm, lọc theo ngày/trạng thái, cập nhật trạng thái
│           └── inventory.js    # Tra cứu tồn kho & Xuất báo cáo Nhập - Xuất - Tồn theo khoảng thời gian
│
└── templates/                  # DUY NHẤT 4 FILE HTML (.html) TRÊN TOÀN BỘ DỰ ÁN
    ├── index.html              # Application Shell dành cho Khách hàng (Header, Nav, Footer, #app)
    ├── admin.html              # Application Shell dành cho Quản trị viên (Sidebar, Topbar, #admin-app)
    ├── login.html              # Giao diện Xác thực phân tách theo vai trò: Khách hàng (2 tabs) & Quản trị viên (/admin/login)
    └── error.html              # Giao diện thông báo lỗi chung (404, 500,...)
```

---

## 4. Các tính năng nổi bật của kiến trúc SPA

### 1. Kiến trúc Application Shell & Render động hoàn toàn
- Mọi trang nội dung (trang chủ, chi tiết sản phẩm, giỏ hàng, thanh toán, lịch sử đơn, hồ sơ cá nhân, dashboard, quản lý sản phẩm, nhập hàng,...) đều được render động bằng **JavaScript Template Literals & DOM API** thông qua các ES Module độc lập.
- Khi chuyển đổi tính năng, **trình duyệt không tải lại (reload) toàn bộ trang web**, giữ nguyên trạng thái ứng dụng và đem lại trải nghiệm mượt mà tức thì.

### 2. Router chuyên nghiệp bằng History API
- Sử dụng `window.history.pushState()` và sự kiện `popstate`.
- **Hỗ trợ URL trực tiếp (Direct URL):** Người dùng có thể F5 tải lại trang hoặc mở trực tiếp link bất kỳ (ví dụ: `/product/1`, `/cart`, `/admin/inventory`) mà trang web vẫn hiển thị chính xác nội dung.
- **Hỗ trợ Back/Forward:** Nút tiến/lùi của trình duyệt hoạt động chuẩn xác.
- **Quản lý vòng đời Module (Lifecycle):** Mỗi module cung cấp hàm `mount(container, params, query)` để khởi tạo và `destroy()` để tự động dọn dẹp các event listener, tránh rò rỉ bộ nhớ (Memory Leak).
- **Thanh trạng thái tải trang (Top Progress Loading Bar):** Hiệu ứng tải trang mượt mà trong quá trình nạp dữ liệu bất đồng bộ.

### 3. Nghiệp vụ Quản trị (Admin) đầy đủ
1. **Bảo vệ Root Admin:** Tài khoản `admin` (ID: 1) không thể bị khóa hoặc xóa từ giao diện lẫn API.
2. **Quản lý khách hàng:** Xem danh sách, tìm kiếm, tạo tài khoản Admin mới, đổi mật khẩu, khóa/mở khóa tài khoản và xóa vĩnh viễn khách hàng (tự động dọn dẹp đơn hàng và giỏ hàng liên quan).
3. **Quản lý Nhập kho 2 bước:**
   - Tạo phiếu nhập hàng ở trạng thái **Bản nháp** (cho phép tự do thêm nhiều mặt hàng, chỉnh sửa, xóa).
   - Khi bấm **Hoàn thành**, hệ thống tự động cộng dồn số lượng vào tồn kho, cập nhật giá vốn mới nhất và khóa phiếu.
4. **Công thức định giá bán tự động:**
   $$\text{Giá bán} = \text{Giá vốn} \times \left(1 + \frac{\text{\% Lợi nhuận}}{100}\right)$$
   Sản phẩm có thể dùng % lợi nhuận riêng hoặc kế thừa % lợi nhuận của loại sản phẩm.
5. **Báo cáo Nhập – Xuất – Tồn:** Tính toán chính xác số lượng tồn đầu kỳ, nhập trong kỳ, xuất (bán) trong kỳ và tồn cuối kỳ trong bất kỳ khoảng thời gian nào.

---

## 5. Luồng hoạt động chi tiết của hệ thống (SPA Data & Workflow)

Hệ thống hoạt động theo mô hình Single Page Application (SPA) tách biệt rõ ràng giữa **Tầng hiển thị (Presentation Layer - Vanilla JS)** và **Tầng dịch vụ dữ liệu (Data & Business Logic Layer - Flask RESTful API)**. Dưới đây là 6 luồng hoạt động chính:

### 5.1. Luồng khởi tạo ứng dụng & Tải trang lần đầu (Bootstrapping Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Browser as Trình duyệt Web
    participant Server as Flask Server (app.py)
    participant Router as SPA Router (router.js)
    participant Module as Page Module (vd: home.js)
    participant DB as SQLite (music_store.db)

    User->>Browser: Nhập URL (vd: / hoặc /product/1)
    Browser->>Server: HTTP GET / hoặc /product/1
    Server-->>Browser: Trả về Application Shell (index.html) kèm initial state
    Note over Browser: Tải CSS (style.css), JS (router.js, api.js)
    Browser->>Router: router.init() kích hoạt
    Router->>Router: Đọc window.location.pathname & so khớp routes
    Router->>Module: module.mount(container, params, query)
    Module->>Browser: Render khung giao diện (Skeleton / Loading UI)
    Module->>Server: fetchAPI('/api/products') (bất đồng bộ)
    Server->>DB: Truy vấn dữ liệu sản phẩm
    DB-->>Server: Kết quả bản ghi
    Server-->>Module: Trả về JSON { success: true, data: [...] }
    Module->>Browser: Render dữ liệu vào DOM (#app) qua Template Literals
```

- **Bước 1:** Trình duyệt gửi yêu cầu GET tới đường dẫn bất kỳ. Flask Server đón nhận và luôn trả về Application Shell (`index.html` cho khách hàng hoặc `admin.html` cho quản trị) cùng `window.__APP_INITIAL_STATE__` (chứa session đăng nhập, danh mục menu, badge giỏ hàng).
- **Bước 2:** Trình duyệt nạp Application Shell và kích hoạt ES Module `router.js`.
- **Bước 3:** Router đọc đường dẫn `window.location.pathname`, dùng các câu lệnh `if / else if` so sánh chuỗi cơ bản (ví dụ: `path === '/'`, `path.startsWith('/product/')`) để xác định chính xác trang cần hiển thị mà không cần cấu hình phức tạp.
- **Bước 4:** Router gọi hàm `mount()` của module tương ứng (ví dụ: `home.js`, `product.js`). Module tạo khung HTML ban đầu, hiển thị spinner/skeleton và gọi API bằng `fetchAPI()`.
- **Bước 5:** Khi API trả dữ liệu JSON, module dùng Template Literals để tạo các phần tử DOM và gắn các bộ lắng nghe sự kiện (Event Listeners).

---

### 5.2. Luồng điều hướng trang không tải lại (Client-Side Navigation Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Browser as Trình duyệt (DOM)
    participant Router as SPA Router
    participant OldPage as Module hiện tại (Trang cũ)
    participant NewPage as Module mới (Trang mới)
    participant API as Flask REST API

    User->>Browser: Nhấp vào liên kết <a href="/cart">
    Browser->>Router: Global click event bắt thẻ <a>
    Note over Router: e.preventDefault() ngăn reload toàn trang
    Router->>Browser: window.history.pushState({}, '', '/cart')
    Note over Router: Thanh địa chỉ URL đổi thành /cart
    Router->>Router: Bật thanh tiến trình Loading Bar ở đầu trang
    Router->>OldPage: oldPage.destroy() (Dọn dẹp event listener, timer)
    Router->>NewPage: newPage.mount(container, params, query)
    NewPage->>API: fetchAPI('/api/cart')
    API-->>NewPage: Dữ liệu giỏ hàng JSON
    NewPage->>Browser: Vẽ lại nội dung giỏ hàng vào <main id="app">
    Router->>Router: Tắt Loading Bar, cuộn lên đầu trang (window.scrollTo(0,0))
```

- **Ngăn chặn tải lại trang:** Toàn bộ thẻ `<a href="...">` nội bộ đều được Router chặn lại bằng `event.preventDefault()`.
- **Cập nhật lịch sử:** Sử dụng `window.history.pushState()` để cập nhật URL trên thanh địa chỉ, giúp người dùng có thể chia sẻ link, bookmark hoặc F5 mà không mất ngữ cảnh.
- **Thu dọn tài nguyên:** Hàm `destroy()` của trang cũ được gọi để gỡ bỏ triệt để các event listener, xóa bộ đếm thời gian, giải phóng bộ nhớ (tránh memory leak).
- **Vẽ giao diện mới:** Module mới được khởi tạo qua `mount()`, chỉ thay đổi vùng nội dung chính (`#app` hoặc `#admin-app`), Header và Footer vẫn được giữ nguyên.

---

### 5.3. Luồng xử lý nút Back / Forward (`popstate`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Browser as Nút Back/Forward Trình duyệt
    participant Router as SPA Router
    participant Module as Module tương ứng URL

    User->>Browser: Bấm nút Quay lại (Back) hoặc Đi tiếp (Forward)
    Browser->>Router: Phát sinh sự kiện window.onpopstate
    Router->>Router: Đọc URL hiện tại từ window.location.pathname
    Router->>Router: Hủy module cũ qua destroy()
    Router->>Module: Gọi module.mount(container, params, query)
    Module->>Browser: Render lại trang tương ứng với URL trong lịch sử
```

- Trình duyệt tự động kích hoạt sự kiện `popstate` khi người dùng bấm Back hoặc Forward.
- Router lắng nghe sự kiện này và nạp module tương ứng với `pathname` hiện thời mà không gọi `pushState()` để tránh làm sai lệch ngăn xếp lịch sử duyệt web.

---

### 5.4. Luồng Mua sắm, Giỏ hàng & Đặt hàng của Khách hàng (E-Commerce Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant Home as Trang chủ (home.js)
    participant Detail as Chi tiết SP (product.js)
    participant Cart as Giỏ hàng (cart.js)
    participant Checkout as Đặt hàng (checkout.js)
    participant API as Flask API (app.py)
    participant DB as SQLite DB

    Customer->>Home: Tìm kiếm, lọc theo loại/giá, chọn sản phẩm
    Home->>API: GET /api/products?keyword=...&category_id=...
    API-->>Home: Danh sách sản phẩm JSON -> Hiển thị danh sách card

    Customer->>Detail: Click xem sản phẩm -> Navigate /product/:id
    Detail->>API: GET /api/products/:id
    API-->>Detail: Thông tin chi tiết SP & Tồn kho thực tế
    Customer->>Detail: Chọn số lượng -> Bấm "Thêm vào giỏ"
    Detail->>API: POST /api/cart/add { product_id, quantity }
    API->>DB: Thêm/cập nhật giỏ hàng trong session / DB
    API-->>Detail: { success: true, total_count: N, message: "..." }
    Detail-->>Customer: Cập nhật số lượng trên Cart Badge ở Header & Hiện Toast

    Customer->>Cart: Vào Giỏ hàng (/cart)
    Cart->>API: GET /api/cart
    API-->>Cart: Danh sách sản phẩm, đơn giá, tạm tính, phí ship
    Customer->>Cart: Bấm tăng/giảm (+/-) số lượng hoặc xóa món
    Cart->>API: PUT /api/cart/update hoặc DELETE /api/cart/remove/:id
    API-->>Cart: Tính lại tổng tiền tức thì không reload trang

    Customer->>Checkout: Bấm "Tiến hành thanh toán" -> Navigate /checkout
    Checkout->>API: GET /api/cart & GET /api/profile
    API-->>Checkout: Dữ liệu giỏ hàng + Địa chỉ/SĐT người nhận mặc định
    Customer->>Checkout: Chọn phương thức (COD / Chuyển khoản QR / Thẻ) & Bấm "Đặt hàng"
    Checkout->>API: POST /api/checkout { recipient_name, phone, address, payment_method }
    API->>DB: Bắt đầu Transaction: Tạo Order, trừ tồn kho, xóa giỏ hàng
    DB-->>API: Transaction Commit thành công
    API-->>Checkout: { success: true, order_code: "DH-XXXXXX" }
    Checkout-->>Customer: Điều hướng sang /order-success/:order_code
```

- **Cập nhật huy hiệu giỏ hàng (Cart Badge):** Ngay khi thêm hàng thành công, Header lắng nghe hoặc cập nhật trực tiếp `#cartBadgeCount` theo thời gian thực mà không cần tải lại trang.
- **An toàn giao dịch:** Tại bước thanh toán (`POST /api/checkout`), Flask Backend thực hiện giao dịch an toàn (Database Transaction): kiểm tra lại tồn kho thực tế, tạo bản ghi đơn hàng, lưu chi tiết từng món hàng, trừ tồn kho và làm rỗng giỏ hàng.

---

### 5.5. Luồng Quản trị Nhập kho & Tự động Tính giá vốn (Inventory & Pricing Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant UI as Module Nhập kho (imports.js)
    participant API as Flask API (app.py)
    participant DB as SQLite DB

    Admin->>UI: Tạo phiếu nhập mới (Chọn NCC, thêm các nhạc cụ, số lượng, giá nhập)
    UI->>API: POST /api/admin/imports (Lưu phiếu ở trạng thái DRAFT - Bản nháp)
    API->>DB: Tạo phiếu nhập và danh sách chi tiết phiếu nhập
    DB-->>API: Lưu thành công (Chưa cộng tồn kho)
    API-->>UI: Hiển thị phiếu nhập ở dạng Bản nháp

    Note over Admin,UI: Admin có thể sửa, thêm, xóa các mặt hàng trong phiếu nháp

    Admin->>UI: Khi kiểm hàng thực tế xong, bấm "Hoàn thành phiếu nhập"
    UI->>API: POST /api/admin/imports/:id/complete
    API->>DB: Khởi động Transaction:
    Note over API,DB: 1. Đổi trạng thái phiếu -> COMPLETED<br/>2. Cộng dồn số lượng vào kho (stock_quantity += quantity)<br/>3. Cập nhật giá vốn mới nhất (cost_price = import_price)<br/>4. Tự động tính lại giá bán = Giá vốn * (1 + % Lợi nhuận)
    DB-->>API: Transaction thành công
    API-->>UI: { success: true, message: "Hoàn thành phiếu nhập thành công!" }
    UI-->>Admin: Cập nhật giao diện phiếu, hiển thị tồn kho và giá bán mới
```

- **Quy trình nhập kho 2 bước an toàn:** Phiếu nhập tạo ở dạng **Bản nháp (Draft)** cho phép chỉnh sửa sai sót. Khi hàng về kho thực tế, Admin mới bấm **Hoàn thành (Complete)**.
- **Tự động hóa giá bán:** Hệ thống tự động áp dụng công thức định giá bán ngay khi giá vốn thay đổi, giải phóng quản trị viên khỏi việc phải tính toán thủ công từng sản phẩm.

---

### 5.6. Luồng Xác thực & Bảo vệ Phân quyền (Auth & Security Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng / Quản trị
    participant Browser as Trình duyệt (SPA)
    participant APIInterceptor as Interceptor (api.js)
    participant Flask as Flask Server (Decorators)

    User->>Browser: Cố gắng truy cập trang cần bảo vệ (vd: /profile hoặc /admin/products)
    Browser->>APIInterceptor: Gửi fetchAPI(url)
    APIInterceptor->>Flask: Gửi HTTP Request kèm Session Cookie
    Flask->>Flask: Kiểm tra @login_required hoặc @admin_required
    alt Chưa đăng nhập hoặc không đủ quyền
        Flask-->>APIInterceptor: HTTP 401 Unauthorized { require_login: true, message: "..." }
        APIInterceptor->>Browser: Hiển thị Toast cảnh báo màu vàng
        APIInterceptor->>Browser: Chuyển hướng sang /login?next=<current_path>
    else Đã đăng nhập và hợp lệ
        Flask-->>APIInterceptor: HTTP 200 OK kèm dữ liệu JSON
        APIInterceptor-->>Browser: Trả dữ liệu cho Module hiển thị bình thường
    end
```

- **Bảo mật 2 lớp:**
  - **Lớp Frontend (UX):** Kiểm tra trạng thái người dùng trong `window.__APP_INITIAL_STATE__`. Nếu chưa đăng nhập, tự động chuyển hướng sang trang đăng nhập kèm tham số `?next=...` để quay lại đúng trang cũ sau khi đăng nhập.
  - **Lớp Backend (Bảo mật cốt lõi):** Tất cả API nhạy cảm được bọc bởi `@login_required` hoặc `@admin_required`. Mọi hành vi cố tình gọi API bằng Postman/cURL mà không có session hợp lệ đều bị từ chối với mã HTTP `401 Unauthorized` hoặc `403 Forbidden`.

---

# 🎓 CẨM NANG VẤN ĐÁP ĐỒ ÁN VỚI GIẢNG VIÊN (KIẾN TRÚC SPA & FRONTEND)

> Tài liệu này tổng hợp toàn bộ các câu hỏi giảng viên hay hỏi nhất khi bảo vệ đồ án Web, giải thích cặn kẽ bản chất kỹ thuật phía Frontend để bạn tự tin đạt điểm tối đa!

---

## ❓ Câu 1: Em hãy giải thích kiến trúc Single Page Application (SPA) của đồ án và quy định 4 file HTML?

### 🎯 Trả lời:
- **Bản chất kiến trúc SPA:** Single Page Application là kiến trúc mà toàn bộ website chỉ tải một trang khung (Application Shell) trong lần truy cập đầu tiên. Khi người dùng điều hướng qua lại giữa các chức năng, trình duyệt **không tải lại toàn bộ trang web** (không gửi request yêu cầu file HTML mới lên server). Thay vào đó, JavaScript sẽ chặn sự kiện chuyển trang, cập nhật thanh địa chỉ URL bằng HTML5 History API (`pushState`) và tự động nạp dữ liệu JSON qua RESTful API để render giao diện vào vùng chứa `<main id="app">`.
- **4 file HTML duy nhất:**
  1. `index.html`: Application Shell cho khách hàng (Header, Thanh tìm kiếm, Menu danh mục, Badge giỏ hàng, Footer và vùng mount `<main id="app">`).
  2. `admin.html`: Application Shell cho quản trị viên (Sidebar, Topbar, thông tin admin và vùng mount `<main id="admin-app">`).
  3. `login.html`: Giao diện Xác thực phân tách theo vai trò: Khách hàng (2 tabs Đăng nhập / Đăng ký) & Quản trị viên (`/admin/login`).
  4. `error.html`: Giao diện thông báo lỗi HTTP chung (404 Not Found, 500 Server Error).
- **Tuyệt đối không có file HTML thứ 5:** Mọi trang chức năng (Chi tiết sản phẩm, Giỏ hàng, Thanh toán, Lịch sử đơn hàng, Hồ sơ cá nhân, Dashboard quản trị, Quản lý kho,...) đều được tách thành các ES6 Module JavaScript riêng biệt (`home.js`, `product.js`, `cart.js`,...) và sinh mã HTML động qua Template Literals.

---

## ❓ Câu 2: Trình duyệt chuyển trang mà không reload như thế nào? Giải thích chi tiết router.js?

### 🎯 Trả lời:
Vị trí: [static/js/router.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/router.js)

```javascript
// 1. Chặn hành vi reload mặc định của thẻ <a>
document.body.addEventListener('click', function(event) {
    let link = event.target.closest('a');
    if (!link) return;
    let href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('/admin')) return;

    event.preventDefault(); // Ngăn trình duyệt reload
    navigate(href); // Đổi URL và render module
});

// 2. Cập nhật URL mà không reload trang qua pushState()
function navigate(url) {
    window.history.pushState({}, '', url);
    let parsedUrl = new URL(url, window.location.origin);
    handleRoute(parsedUrl.pathname, parsedUrl.searchParams, true);
}

// 3. Lắng nghe nút Back / Forward của trình duyệt qua sự kiện popstate
window.addEventListener('popstate', function() {
    let currentPath = window.location.pathname;
    let queryParams = new URLSearchParams(window.location.search);
    handleRoute(currentPath, queryParams, false);
});
```

- **Hỗ trợ URL trực tiếp (Direct URL Refresh):** Khi người dùng F5 hoặc gõ thẳng link (vd: `/product/15`), Flask Server tại `app.py` bắt route này và trả về `index.html`. Sau đó `router.js` được nạp, đọc `window.location.pathname` và tự động kích hoạt `product.js` nạp đúng sản phẩm đó.

---

## ❓ Câu 3: Vòng đời của một trang (Component Lifecycle) hoạt động ra sao? Ý nghĩa của mount() và destroy()?

### 🎯 Trả lời:
Vị trí: Mỗi module trong `static/js/pages/` (ví dụ [home.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/pages/home.js), [cart.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/pages/cart.js))

1. **`mount(container, params)`:**
   - Được Router gọi khi người dùng mở trang.
   - Nhận vào phần tử DOM cha `container` (`<main id="app">`).
   - Thiết lập `document.title`, render khung HTML ban đầu kèm Skeleton/Loading spinner.
   - Gọi Fetch API lấy dữ liệu JSON, sau đó gán sự kiện (`addEventListener`) cho các nút bấm.
2. **`destroy()`:**
   - Được Router tự động gọi ngay trước khi chuyển sang trang khác:
   ```javascript
   if (currentModule && typeof currentModule.destroy === 'function') {
       currentModule.destroy();
   }
   ```
   - *Ý nghĩa:* Dỡ bỏ toàn bộ `removeEventListener`, hủy các bộ đếm `setTimeout`/`setInterval`, tránh hiện tượng rò rỉ bộ nhớ (Memory Leak) hoặc sự kiện chạy ngầm của trang cũ.

---

## ❓ Câu 4: Dữ liệu giỏ hàng được quản lý và đồng bộ như thế nào?

### 🎯 Trả lời:
Vị trí: [static/js/pages/cart.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/pages/cart.js) & [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js)

- **Cơ chế 2 lớp (Hybrid Cart):**
  1. **Khách vãng lai (Chưa đăng nhập):** Giỏ hàng được lưu trữ dưới dạng mảng JSON trong `localStorage.getItem('cart')`. Giúp khách hàng thoải mái chọn hàng mà không bị bắt buộc đăng nhập ngay.
  2. **Khách đã đăng nhập:** Khi thêm vào giỏ, hệ thống vừa lưu LocalStorage vừa gọi POST `/api/cart` để lưu vào bảng `cart_items` trong database.
  3. **Đồng bộ khi đăng nhập (Merge Cart):** Ngay khi khách đăng nhập thành công, hệ thống đọc các món trong `localStorage` và đồng bộ lên server, bảo toàn các món hàng khách vừa chọn.
- **Đồng bộ Badge giỏ hàng tức thì:** Hàm toàn cục `window.updateCartBadge(count)` được gọi mỗi khi thêm/xóa/sửa số lượng, cập nhật ngay con số hiển thị trên Header mà không cần tải lại trang.

---

## ❓ Câu 5: Công thức định giá bán tự động và quy trình Nhập kho diễn ra như thế nào?

### 🎯 Trả lời:
Vị trí: [database.py](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/database.py) & [static/js/admin/imports.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin/imports.js), [pricing.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin/pricing.js)

1. **Quy trình Nhập kho 2 bước chuẩn ERP:**
   - **Bước 1 (Lưu nháp):** Tạo phiếu nhập với nhiều mặt hàng, số lượng và đơn giá nhập. Phiếu ở trạng thái `draft`, số lượng tồn kho của sản phẩm **chưa tăng**, cho phép nhân viên rà soát, chỉnh sửa số liệu.
   - **Bước 2 (Hoàn thành phiếu):** Bấm "Hoàn thành", trạng thái chuyển thành `completed`. Hệ thống bắt đầu Transaction trong SQLite:
     - Cộng dồn số lượng nhập vào `stock_quantity`.
     - Cập nhật `latest_cost_price` (giá vốn gần nhất).
     - **Tự động kích hoạt tính lại giá bán** cho sản phẩm theo công thức định giá.
2. **Công thức định giá tự động:**
   $$	ext{Giá bán} = 	ext{Giá nhập gần nhất} 	imes \left(1 + rac{\%	ext{ Lợi nhuận định mức của Loại}}{100}ight)$$
   - Ví dụ: Đàn Guitar nhập vào $10.000.000$ đ, % lãi định mức là $25\% ightarrow 	ext{Giá bán} = 10.000.000 	imes 1.25 = 12.500.000$ đ.
   - Khi quản trị viên thay đổi % lãi của loại Đàn Guitar từ $25\% ightarrow 30\%$, toàn bộ đàn Guitar trong cửa hàng tự động đổi giá bán mà không cần sửa thủ công từng sản phẩm.

---

## ❓ Câu 6: Làm thế nào để ngăn chặn hành vi tự xóa hoặc tự khóa tài khoản Admin tối cao?

### 🎯 Trả lời:
Vị trí: [static/js/admin/users.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin/users.js) & [app.py](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/app.py)

1. **Tài khoản Root (ID = 1):** Tài khoản quản trị khởi tạo mặc định (`admin`) có ID cố định là `1`.
2. **Ẩn nút thao tác ở Frontend:** Trong vòng lặp render danh sách người dùng, nếu `u.id === 1`, hệ thống không tạo nút "Khóa tài khoản" hoặc "Xóa", thay bằng huy hiệu `[Quản trị tối cao]`.
3. **Bảo vệ 2 lớp ở Backend:** Ngay cả khi người dùng cố tình can thiệp gọi API, Backend Flask tại `app.py` kiểm tra:
   ```python
   if user_id == 1:
       return jsonify({'success': False, 'message': 'Không được phép khóa tài khoản Quản trị viên tối cao'}), 400
   ```

---

## ❓ Câu 7: Validate dữ liệu ở Client (Frontend) và Server (Backend) khác nhau như thế nào? Tại sao cần cả hai?

### 🎯 Trả lời:
- **Client-Side Validation (Frontend):**
  - Kiểm tra độ dài mật khẩu $\ge 6$ ký tự, số điện thoại đúng 10 số, họ tên $\ge 2$ ký tự trước khi gửi request.
  - *Mục đích:* Phản hồi tức thì cho người dùng, nâng cao trải nghiệm (UX), giảm thiểu request sai định dạng gửi lên server.
- **Server-Side Validation (Backend):**
  - Kiểm tra lại toàn bộ dữ liệu trong `app.py` bằng Python regex và truy vấn database (tồn tại username, trùng email/SĐT, số lượng tồn kho thực tế).
  - *Mục đích:* **Bảo mật tuyệt đối**. Client-side validation có thể bị vượt qua dễ dàng bằng Postman, cURL hoặc tắt JavaScript ở trình duyệt.

---

## ❓ Câu 8: Tại sao mã nguồn JavaScript Frontend được viết theo phong cách hàm thuần đơn giản, không dùng Class OOP hay Framework?

### 🎯 Trả lời:
1. **Dễ đọc, dễ giải thích khi bảo vệ đồ án:** Mã nguồn sử dụng các khái niệm JavaScript nền tảng (`let`, `const`, `function`, `if/else`, vòng lặp `for`, DOM API, Fetch API với `async/await`), giúp sinh viên tự tin giải thích cặn kẽ bản chất luồng dữ liệu mà không bị phụ thuộc vào các thư viện bên thứ ba hay cú pháp che giấu bản chất.
2. **Hiệu năng cao & Dung lượng nhẹ:** Không phát sinh chi phí trừu tượng (overhead) từ framework lớn như React/Vue, toàn bộ trang web tải cực nhanh và chạy mượt mà ngay cả trên thiết bị cấu hình yếu.
3. **Tuân thủ tuyệt đối quy định đồ án:** Đảm bảo toàn bộ dự án chỉ có đúng 4 file HTML (`index.html`, `admin.html`, `login.html`, `error.html`), từng chức năng là một module JS độc lập, có hàm `mount()` để khởi tạo và `destroy()` để giải phóng tài nguyên.

---

## ❓ Câu 9: Tại sao dự án tách hoàn toàn CSS ra khỏi HTML, không dùng thẻ <style> và thuộc tính style=""?

### 🎯 Trả lời:
1. **Nguyên lý phân tách mối quan tâm (Separation of Concerns):** HTML chỉ đảm nhận cấu trúc dữ liệu và ngữ nghĩa (Semantic structure), CSS chịu trách nhiệm trình bày giao diện (Presentation & Styling), JavaScript xử lý nghiệp vụ và điều hướng (Behavior). Không trộn lẫn CSS vào HTML giúp mã nguồn trong sáng, dễ đọc và dễ bảo vệ trước hội đồng.
2. **Khả năng tái sử dụng & Dễ bảo trì:** Định dạng được gom nhóm vào 4 file CSS chuyên biệt (`style.css`, `admin.css`, `login.css`, `components.css`). Khi cần thay đổi thiết kế (ví dụ đổi màu sắc thương hiệu, độ bo góc, khoảng cách), chỉ cần sửa tại một file CSS duy nhất mà không phải rà soát từng dòng HTML.
3. **Tận dụng bộ nhớ đệm trình duyệt (Browser Caching):** Các file `.css` tĩnh được trình duyệt tải một lần và lưu vào cache. Các lần truy cập tiếp theo hoặc khi chuyển trang trong SPA không làm phát sinh lưu lượng tải lại mã CSS.
4. **Điều khiển trạng thái giao diện chuẩn mực qua DOM API:** Thay vì can thiệp trực tiếp vào `element.style.display` gây phân mảnh mã nguồn, dự án sử dụng các class trạng thái (`.active`, `.hidden`) kết hợp cùng các phương thức `classList.add()`, `classList.remove()`, `classList.toggle()`, giúp việc debug CSS trực quan qua DevTools.

---

## 🛠 BẢNG TRA CỨU "SỬA NHANH TẠI CHỖ" KHI GIẢNG VIÊN YÊU CẦU

Khi vấn đáp, giảng viên thường yêu cầu: *"Em hãy sửa dòng code này xem trang web thay đổi như thế nào?"*. Dưới đây là vị trí chính xác để bạn chỉnh sửa ngay lập tức:

| Giảng viên yêu cầu | Nơi cần mở file | Vị trí cần chỉnh sửa |
|---|---|---|
| **Đổi màu chủ đạo website** | [static/css/style.css](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/css/style.css) | Sửa `--primary: #d97706;` ở đầu file thành mã màu khác (vd: `#2563eb` - xanh dương). |
| **Đổi số lượng sản phẩm mỗi trang** | [static/js/pages/home.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/pages/home.js) | Sửa `limit: 8` trong biến `homeFilters` thành `4` hoặc `12`. |
| **Đổi ngưỡng cảnh báo hết hàng** | [app.py](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/app.py) & [inventory.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin/inventory.js) | Tìm số `5` trong `stock_quantity <= 5` đổi thành `10`. |
| **Thay đổi cách format tiền tệ** | [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js) | Tìm hàm `formatVND(amount)`, sửa ký hiệu `' ₫'` thành `' VNĐ'`. |
| **Đổi thời gian tự tắt thông báo** | [static/js/api.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/api.js) | Tìm `setTimeout(..., 4000)`, đổi `4000` (4s) thành `2000` (2s) hoặc `6000` (6s). |
| **Thêm cột hiển thị thông tin bảng Admin** | [static/js/admin/users.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/admin/users.js) | Thêm thẻ `<th>` trong `renderUsersShell()` và thêm `<td>${u.ten_thuoc_tinh}</td>` trong hàm `loadUsers()`. |
| **Đổi đường dẫn điều hướng trang** | [static/js/router.js](file:///c:/Users/Admin/OneDrive/Desktop/DAWEB1/static/js/router.js) | Thêm hoặc sửa nhánh điều kiện `else if (path.startsWith(...))` trong hàm `handleRoute()`. |
