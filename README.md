# Website Bán Dụng Cụ Âm Nhạc (Melody Store)

Dự án website thương mại điện tử chuyên kinh doanh nhạc cụ (Guitar, Piano & Keyboard, Trống & Bộ gõ, Violin, Kèn & Sáo, Phụ kiện âm nhạc).
- **Backend:** Python (Flask RESTful API, SQLite)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

---

## 1. Hướng dẫn chạy ứng dụng

### Cách 1: Chạy nhanh bằng file `run.bat` (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file **`run.bat`** trong thư mục dự án. Hệ thống sẽ tự động cài đặt thư viện cần thiết, khởi tạo cơ sở dữ liệu mẫu và bật máy chủ.

### Cách 2: Chạy bằng dòng lệnh (Terminal / Command Prompt)
```bash
# 1. Cài đặt các thư viện
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
| **Admin (Quản trị)** | `admin` | `admin123` | Quản trị toàn quyền hệ thống |
| **Khách hàng 1** | `khachhang1` | `123456` | Đã có sẵn đơn hàng và địa chỉ |
| **Khách hàng 2** | `khachhang2` | `123456` | Khách hàng mua sắm |
| **Khách hàng bị khóa** | `khachhang_bi_khoa` | `123456` | Thử nghiệm chặn đăng nhập khi tài khoản bị khóa |

---

## 3. Danh sách chức năng đã hoàn thành

### I. Phân hệ Admin (Quản trị)
1. **Giao diện Admin:**
   - Trang đăng nhập riêng biệt độc lập tại `/admin/login`.
   - Bảng điều khiển (Dashboard) với thống kê doanh thu, đơn hàng, hàng sắp hết và menu sidebar trực quan.
2. **Quản lý người dùng / khách hàng:**
   - Xem danh sách đầy đủ thông tin khách hàng.
   - Tìm kiếm khách hàng theo tên, username, SĐT, email.
   - Reset mật khẩu khách hàng.
   - Khóa / Mở khóa tài khoản ngay lập tức.
3. **Quản lý loại sản phẩm:**
   - Thêm loại sản phẩm mới (Mã loại, Tên, Mô tả, % Lợi nhuận định mức).
   - Chỉnh sửa thông tin loại sản phẩm.
   - Xóa loại sản phẩm hoặc Ẩn/Hiện loại trên website.
4. **Quản lý danh mục sản phẩm:**
   - Thêm sản phẩm (Loại, Mã, Tên, Hình ảnh, Mô tả, Giá vốn, % Lợi nhuận riêng).
   - Sửa sản phẩm: Form hiển thị chính xác 100% dữ liệu cũ trước khi sửa.
   - Xóa hoặc Ẩn/Hiện sản phẩm trên trang bán hàng.
5. **Quản lý Nhập sản phẩm:**
   - Hiển thị danh mục phiếu nhập hàng, tìm kiếm theo mã, khoảng ngày và trạng thái.
   - Thêm phiếu nhập hàng: Chọn ngày nhập, chọn nhiều sản phẩm, nhập giá nhập và số lượng từng loại.
   - Sửa và Hoàn thành: Chỉ cho phép sửa phiếu khi ở trạng thái **Bản nháp**. Khi bấm **Hoàn thành**, hệ thống tự động cộng dồn tồn kho và cập nhật giá vốn, đồng thời khóa không cho sửa nữa.
6. **Quản lý giá bán & % Lợi nhuận:**
   - Hiển thị và cập nhật tỉ lệ % lợi nhuận theo loại sản phẩm.
   - Cho phép thiết lập % lợi nhuận riêng cho từng sản phẩm (ghi đè loại).
   - Bảng tra cứu giá vốn, % lợi nhuận và giá bán tự động theo công thức:
     `Giá bán = Giá vốn * (1 + % Lợi nhuận / 100)`
7. **Quản lý đơn đặt hàng:**
   - Tra cứu và lọc đơn hàng theo (1) Khoảng thời gian ngày đặt (Từ ngày - Đến ngày); (2) Tình trạng đơn hàng.
   - Xem chi tiết đơn hàng (thông tin người nhận, danh sách sản phẩm, hình thức thanh toán).
   - Cập nhật tình trạng đơn: *Mới đặt* $\rightarrow$ *Đã xử lý* $\rightarrow$ *Đã giao* hoặc *Hủy* (tự động hoàn kho nếu hủy).
8. **Quản lý số lượng tồn & Báo cáo:**
   - Tra cứu tồn kho hiện tại của từng sản phẩm, lọc theo loại.
   - Cảnh báo trực quan các sản phẩm sắp hết hàng (tồn kho $\le 5$ chiếc).
   - Báo cáo **Nhập - Xuất - Tồn** theo khoảng thời gian tùy chọn: Tồn đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Tồn cuối kỳ và Tồn thực tế hiện tại.

---

### II. Phân hệ Khách hàng (End-user)
1. **Quản lý đăng nhập:**
   - Đăng ký tài khoản mới với đầy đủ thông tin cá nhân và địa chỉ nhận hàng.
   - Đăng nhập / Đăng xuất, hiển thị tên khách hàng và menu tài khoản trên thanh điều hướng (navbar).
   - Quản lý (xem / sửa) hồ sơ cá nhân và đổi mật khẩu.
   - Chặn đăng nhập nếu tài khoản bị Admin khóa.
2. **Hiển thị & Tìm kiếm sản phẩm:**
   - Xem sản phẩm theo phân loại có phân trang mượt mà.
   - Trang chi tiết sản phẩm với hình ảnh lớn, thông số chi tiết, tình trạng kho và chọn số lượng mua.
   - Tìm kiếm cơ bản theo tên nhạc cụ.
   - Tìm kiếm nâng cao kết hợp đồng thời: Tên sản phẩm + Phân loại danh mục + Khoảng giá (Giá từ - Giá đến) trong một thao tác tìm kiếm duy nhất, có phân trang.
3. **Giỏ hàng & Đặt hàng (Bắt buộc đăng nhập mới sử dụng được):**
   - Chọn mua trực tiếp từ danh mục hoặc từ trang chi tiết sản phẩm.
   - Tăng/giảm số lượng hoặc xóa sản phẩm khỏi giỏ hàng.
   - Thanh toán (Checkout):
     - Lựa chọn 1: Lấy địa chỉ mặc định từ tài khoản cá nhân.
     - Lựa chọn 2: Nhập địa chỉ giao hàng mới (đầy đủ các trường: Người nhận, SĐT, Địa chỉ chi tiết, Ghi chú giao hàng).
     - Lựa chọn phương thức thanh toán: Tiền mặt khi nhận hàng (COD - Mặc định), Chuyển khoản ngân hàng (có QR/tài khoản), Thanh toán trực tuyến.
   - Xem lại đơn đặt hàng chi tiết ngay sau khi hoàn tất mua sắm.
4. **Xem lại đơn hàng đã mua:**
   - Khách hàng xem lại toàn bộ lịch sử đơn hàng đã đặt, theo dõi tiến độ xử lý đơn và chi tiết từng món hàng.
