# 🎵 Website Bán Dụng Cụ Âm Nhạc (Melody Store)

> **Học phần:** Lập trình Web và Ứng dụng — Khoa Công Nghệ Thông Tin — Trường Đại học Sài Gòn  
> **Kiến trúc đồ án:** Chuẩn **4 trang HTML hoàn chỉnh**, liên kết đồng bộ dữ liệu thời gian thực qua **LocalStorage** và hỗ trợ chạy trên cả môi trường Offline (Local `file:///`) lẫn Web Server (Python Flask API).

---

## 📋 1. Danh sách 4 File HTML Chính của Đồ Án

| File | Tên phân hệ | Nội dung & Chức năng bao phủ | Điểm Barem |
|---|---|---|---|
| **`index.html`** | **Trang chủ & Tìm kiếm** | Banner, Danh mục dạng chips, Lưới sản phẩm phân trang (8 SP/trang), Modal chi tiết nhạc cụ (ảnh, thông số, tồn kho, thêm vào giỏ), Bộ lọc sắp xếp (giá, tên), Tìm kiếm nhanh trên Header và **Tìm kiếm nâng cao kết hợp 4 tiêu chí** (từ khóa + loại + giá từ + giá đến). | **II.2** (2.0 đ) |
| **`customer.html`** | **Khách hàng & Đơn hàng** | Tab 1: Đăng ký & Đăng nhập (chặn tài khoản khóa); Tab 2: Xem/sửa thông tin cá nhân & Đổi mật khẩu; Tab 3: Giỏ hàng (tăng/giảm số lượng, xóa); Tab 4: Thanh toán Checkout (chọn địa chỉ mặc định/mới, COD/Chuyển khoản/Online, xem lại đơn); Tab 5: Lịch sử đơn hàng & Tiến độ xử lý (Mới đặt $\rightarrow$ Đã xử lý $\rightarrow$ Đã giao). | **II.1, II.3, II.4** (3.0 đ) |
| **`admin.html`** | **Quản trị & Danh mục** | Đăng nhập Admin riêng biệt (`admin` / `admin123`), Sidebar menu quản trị, **Dashboard 6 chỉ số kinh doanh** (Doanh thu, Đơn hàng, Đơn chờ, Sản phẩm, Khách hàng, Cảnh báo kho) + Bảng 5 đơn mới nhất; Quản lý người dùng (lọc role, tìm kiếm tức thì, khóa/mở khóa có chặn ID 1, đổi pass, thêm Admin); Quản lý loại sản phẩm (CRUD, % lợi nhuận); Quản lý sản phẩm (CRUD hiển thị đúng 100% dữ liệu cũ, tính giá bán tự động). | **I.1, I.2, I.3, I.4** (2.5 đ) |
| **`admin-ops.html`** | **Vận hành & Tồn kho** | Quản lý phiếu nhập hàng (thêm phiếu, sửa bản nháp, hoàn thành cộng dồn kho & cập nhật giá vốn, tạo phiếu nhanh từ cảnh báo kho); Quản lý giá bán (% lợi nhuận theo loại & riêng từng SP, xem giá vốn/giá bán); Quản lý đơn hàng (lọc theo khoảng ngày & tình trạng, chi tiết đơn, cập nhật trạng thái, tự động hoàn kho nếu hủy); Quản lý tồn kho (tra cứu theo loại, cảnh báo $\le 5$ chiếc, báo cáo Nhập–Xuất–Tồn theo khoảng thời gian). | **I.5, I.6, I.7, I.8** (2.5 đ) |

---

## 🚀 2. Hướng dẫn chạy và chấm bài

### Cách 1: Chấm bài Offline bằng Google Chrome (Khuyên dùng cho Giảng viên)
- Theo đúng yêu cầu của giảng viên: *"Chấm bài trên web browser Google Chrome trên laptop của giảng viên, chấm file html bằng đường dẫn tuyệt đối (local) trên laptop"*.
- **Chỉ cần nhấp đúp chuột trực tiếp vào file [`index.html`](index.html)** hoặc kéo thả vào Google Chrome để xem và tương tác toàn bộ website mà không cần cài đặt phần mềm hay bật bất kỳ máy chủ nào.
- 4 file HTML tự động nhận và lưu dữ liệu vào `localStorage`, đồng bộ giỏ hàng, đơn hàng và tài khoản giữa các trang mượt mà.

### Cách 2: Chạy nhanh bằng file `run.bat` (Trên Windows)
- Nhấp đúp chuột vào file **`run.bat`** trong thư mục dự án. Hệ thống sẽ tự động kiểm tra thư viện Python, nạp dữ liệu mẫu và bật máy chủ tại:
  - **Trang chủ:** [http://127.0.0.1:5000/index.html](http://127.0.0.1:5000/index.html)
  - **Khách hàng:** [http://127.0.0.1:5000/customer.html](http://127.0.0.1:5000/customer.html)
  - **Quản trị:** [http://127.0.0.1:5000/admin.html](http://127.0.0.1:5000/admin.html)
  - **Vận hành:** [http://127.0.0.1:5000/admin-ops.html](http://127.0.0.1:5000/admin-ops.html)

### Cách 3: Chạy bằng dòng lệnh (Terminal / Command Prompt)
```bash
# 1. Cài đặt các thư viện (nếu muốn dùng backend API)
pip install -r requirements.txt

# 2. Khởi tạo dữ liệu mẫu ban đầu
python seed_data.py

# 3. Khởi chạy máy chủ
python app.py
```

---

## 🔑 3. Tài khoản mặc định hệ thống

| Phân hệ | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin tối cao (ID: 1)** | `admin` | `admin123` | Quản trị viên hệ thống, được bảo vệ không thể bị khóa hoặc xóa |
| **Khách hàng 1** | `khachhang1` | `123456` | Đã có sẵn lịch sử đơn hàng và địa chỉ tại TP.HCM |
| **Khách hàng 2** | `khachhang2` | `123456` | Tài khoản khách hàng thông thường tại Hà Nội |
| **Khách hàng bị khóa** | `khachhang_bi_khoa` | `123456` | Tài khoản dùng để kiểm thử tính năng **chặn đăng nhập tài khoản bị khóa** |

---

## 📁 4. Cấu trúc thư mục dự án

```text
ShopNhacCU/
├── index.html                  # [Trang 1/4] Trang chủ khách: Banner, Danh mục, Lưới SP, Chi tiết Modal, Tìm kiếm
├── customer.html               # [Trang 2/4] Khách hàng: Đăng ký, Đăng nhập, Profile, Giỏ hàng, Checkout, Lịch sử đơn
├── admin.html                  # [Trang 3/4] Quản trị: Login riêng, Dashboard thống kê, Quản lý User, Loại SP, Sản phẩm
├── admin-ops.html              # [Trang 4/4] Vận hành: Phiếu nhập hàng, Bảng giá & % lãi, Quản lý Đơn hàng, Tồn kho
│
├── app.py                      # Backend Flask API & Điều hướng web server linh hoạt
├── database.py                 # Schema SQLite (8 bảng), kết nối DB và công thức định giá
├── seed_data.py                # Script nạp dữ liệu mẫu ban đầu (nhạc cụ, danh mục, tài khoản)
├── test_app.py                 # Bộ kiểm thử tự động 5 test cases đảm bảo API chuẩn xác
├── music_store.db              # File cơ sở dữ liệu SQLite
├── requirements.txt            # Thư viện Flask, Werkzeug
├── run.bat                     # File chạy tự động 1-click trên Windows
│
└── static/                     # TÀI NGUYÊN CSS & JAVASCRIPT
    ├── css/
    │   ├── style.css           # CSS giao diện khách hàng (Layout, Grid, Responsive, Modal)
    │   └── admin.css           # CSS giao diện quản trị (Sidebar, Bảng, Toast thông báo, Modal)
    └── js/
        ├── api.js              # Hàm dùng chung: fetchAPI(), showToast(), formatVND(), formatDate()
        ├── app.js              # Logic Javascript giao diện khách hàng
        └── admin.js            # Logic Javascript giao diện quản trị
```

---

## 📊 5. Chi tiết Barem Điểm và Vị trí Tính năng

### I. CÁC CHỨC NĂNG CHO ADMIN (5.0 điểm)
1. **Giao diện Admin (0.5đ):** 
   - Trang đăng nhập riêng biệt tại `admin.html` (form riêng, không dùng chung với khách).
   - Danh mục chức năng quản trị bên sidebar trái.
2. **Quản lý người dùng / khách hàng (0.75đ):**
   - Hiển thị danh sách khách hàng (`admin.html` $\rightarrow$ mục Người dùng).
   - Reset mật khẩu qua modal popup.
   - Khóa / Mở khóa tài khoản (có bảo vệ chống tự khóa và chặn ID 1).
3. **Quản lý loại sản phẩm (0.5đ):**
   - Thêm, sửa, xóa / ẩn loại sản phẩm (`admin.html` $\rightarrow$ mục Danh mục).
4. **Quản lý danh mục sản phẩm (0.75đ):**
   - Thêm sản phẩm gồm loại, mã, tên, hình ảnh, mô tả (`admin.html` $\rightarrow$ mục Sản phẩm).
   - Sửa sản phẩm: **Hiển thị chính xác 100% dữ liệu cũ trước khi sửa**.
   - Xóa / Ẩn sản phẩm.
5. **Quản lý Nhập sản phẩm (0.75đ):**
   - Hiển thị & tìm kiếm danh mục phiếu nhập hàng (`admin-ops.html` $\rightarrow$ mục Phiếu nhập).
   - Thêm phiếu nhập gồm ngày nhập, giá nhập và số lượng của từng sản phẩm.
   - Sửa phiếu nhập ở trạng thái Bản nháp; khi bấm **Hoàn thành** tự động cộng dồn kho và cập nhật giá vốn.
6. **Quản lý giá bán (0.5đ):**
   - Hiển thị & nhập/sửa % lợi nhuận theo loại sản phẩm và theo từng sản phẩm riêng lẻ (`admin-ops.html` $\rightarrow$ mục Giá bán).
   - Tự động tính giá bán: $\text{Giá bán} = \text{Giá vốn} \times (1 + \% \text{Lợi nhuận} / 100)$.
7. **Quản lý đơn đặt hàng (0.5đ):**
   - Tra cứu đơn hàng theo: (1) Khoảng thời gian đặt; (2) Tình trạng đơn hàng (`admin-ops.html` $\rightarrow$ mục Đơn hàng).
   - Xem chi tiết đơn hàng & cập nhật tình trạng (Mới đặt, Đã xử lý, Đã giao, Hủy).
   - **Tự động hoàn trả tồn kho nếu hủy đơn hàng**.
8. **Quản lý số lượng tồn của sản phẩm (0.75đ):**
   - Tra cứu số lượng tồn theo phân loại tại một thời điểm (`admin-ops.html` $\rightarrow$ mục Tồn kho).
   - Cảnh báo sản phẩm sắp hết hàng ($\le 5$ chiếc) kèm nút tạo phiếu nhập nhanh.
   - Báo cáo tra cứu **Nhập – Xuất – Tồn** theo khoảng thời gian.

### II. CÁC CHỨC NĂNG CHO KHÁCH HÀNG (5.0 điểm)
1. **Quản lý đăng nhập (1.0đ):**
   - Đăng ký tài khoản mới (`customer.html` $\rightarrow$ Tab Đăng nhập/Đăng ký).
   - Đăng nhập / Đăng xuất, hiển thị tên tài khoản ở góc trên và chặn tài khoản bị khóa.
   - Xem & sửa thông tin cá nhân, đổi mật khẩu.
2. **Hiển thị và tìm kiếm sản phẩm (1.5đ):**
   - Hiển thị sản phẩm theo phân loại có phân trang 8 SP/trang (`index.html`).
   - Hiển thị chi tiết sản phẩm qua Modal Popup lớn đầy đủ ảnh, thông số, tồn kho.
   - Tìm kiếm cơ bản theo tên nhạc cụ trên Header.
   - Tìm kiếm nâng cao kết hợp đồng thời tên + phân loại + khoảng giá từ - đến.
3. **Mua sản phẩm bằng giỏ hàng (2.25đ):**
   - Mua sản phẩm từ trang danh mục và từ trang chi tiết sản phẩm.
   - Thêm, bớt, tăng/giảm số lượng và xóa sản phẩm trong giỏ hàng (`customer.html` $\rightarrow$ Tab Giỏ hàng).
   - Quy trình Checkout: Chọn địa chỉ từ tài khoản hoặc nhập địa chỉ giao hàng mới (`customer.html` $\rightarrow$ Tab Thanh toán).
   - Chọn hình thức thanh toán: **Tiền mặt COD (mặc định)**, Chuyển khoản hoặc Trực tuyến.
   - Xem lại đơn đặt hàng chi tiết khi kết thúc quá trình mua.
4. **Xem lại đơn hàng đã mua (0.25đ):**
   - Xem lại toàn bộ đơn hàng đã mua kèm thanh tiến độ xử lý đơn hàng (`customer.html` $\rightarrow$ Tab Lịch sử đơn hàng).
