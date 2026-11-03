# Melody Store - Website Kinh Doanh Nhạc Cụ

Melody Store là ứng dụng web thương mại điện tử chuyên cung cấp các loại nhạc cụ chính hãng (Guitar, Piano, Trống, Violin, v.v.). Hệ thống cung cấp đầy đủ hai phân hệ độc lập: phân hệ khách hàng (duyệt sản phẩm, tìm kiếm nâng cao, giỏ hàng, thanh toán, theo dõi đơn hàng) và phân hệ quản trị viên (bảng điều khiển doanh số, quản lý người dùng, danh mục nhạc cụ, nhập kho, định giá và báo cáo tồn kho).

---

## 1. Công nghệ sử dụng

- HTML5: Cấu trúc ngữ nghĩa tiêu chuẩn.
- CSS3: Giao diện thiết kế tông màu trắng kết hợp vàng nâu gỗ guitar, hỗ trợ Responsive Web Design, Flexbox và Grid.
- JavaScript (ES6+): Xử lý toàn bộ logic nghiệp vụ, đồng bộ dữ liệu thời gian thực.
- LocalStorage API: Lưu trữ và đồng bộ trạng thái dữ liệu (sản phẩm, loại hàng, tài khoản, giỏ hàng, hóa đơn, phiếu nhập) hoàn toàn trên trình duyệt, không cần cấu hình cơ sở dữ liệu bên ngoài.

---

## 2. Cấu trúc thư mục

```text
ShopNhacCu/
│
├── index.html              # Trang chủ và cửa hàng sản phẩm
├── customer.html           # Cổng khách hàng (Tài khoản, Giỏ hàng, Thanh toán, Đơn mua)
├── admin.html              # Cổng quản trị hệ thống và danh mục sản phẩm
├── admin-ops.html          # Cổng quản trị nghiệp vụ vận hành (Nhập kho, Giá, Đơn hàng, Tồn kho)
│
├── static/
│   ├── css/
│   │   ├── style.css       # Định kiểu giao diện người dùng và trang bán hàng
│   │   └── admin.css       # Định kiểu giao diện bảng điều khiển quản trị
│   │
│   └── js/
│       └── store.js        # Cơ sở dữ liệu MusicStoreDB quản lý nghiệp vụ và LocalStorage
│
├── run.bat                 # Tệp lệnh khởi chạy nhanh ứng dụng
└── README.md               # Tài liệu giới thiệu và hướng dẫn sử dụng
```

---

## 3. Cài đặt và cách chạy

Hệ thống được thiết kế dạng Web Application phía client, không yêu cầu cài đặt server hay môi trường bổ sung.

### Cách 1: Mở trực tiếp trên trình duyệt
Nhấp đúp chuột vào tệp `index.html` (hoặc mở bằng các trình duyệt phổ biến như Google Chrome, Microsoft Edge, Mozilla Firefox).

### Cách 2: Sử dụng tệp khởi chạy
Nhấp đúp chuột vào tệp `run.bat` trong thư mục gốc của dự án để trình duyệt mặc định tự động mở trang chủ.

---

## 4. Giới thiệu các trang chức năng

### 4.1. Trang cửa hàng (`index.html`)
- Hiển thị danh sách sản phẩm theo danh mục và có phân trang.
- Tìm kiếm cơ bản theo tên nhạc cụ.
- Tìm kiếm nâng cao kết hợp đồng thời ba tiêu chí: từ khóa tên, loại sản phẩm và khoảng giá (từ giá thấp đến giá cao).
- Xem modal chi tiết nhạc cụ với hình ảnh, mô số kỹ thuật và nút thêm nhanh vào giỏ hàng.

### 4.2. Cổng thông tin khách hàng (`customer.html`)
- Chuyển đổi linh hoạt giữa màn hình Đăng nhập và Đăng ký tài khoản mới.
- Quản lý hồ sơ cá nhân: cập nhật họ tên, số điện thoại, địa chỉ nhận hàng và đổi mật khẩu.
- Giỏ hàng trực tuyến: cập nhật số lượng, tính tổng tiền tự động, xóa sản phẩm.
- Thanh toán đơn hàng: hỗ trợ các phương thức COD (thanh toán khi nhận hàng), chuyển khoản ngân hàng và ví điện tử, cho phép dùng địa chỉ mặc định hoặc nhập địa chỉ mới.
- Lịch sử đơn hàng: theo dõi danh sách các đơn đã đặt và chi tiết sản phẩm trong từng đơn.

### 4.3. Cổng quản trị hệ thống (`admin.html`)
- Xác thực đăng nhập dành riêng cho Quản trị viên.
- Bảng điều khiển (Dashboard): tổng hợp KPI doanh thu, số đơn hàng mới, tổng khách hàng và cảnh báo hàng sắp hết.
- Quản lý người dùng: xem danh sách khách hàng, tìm kiếm, chỉnh sửa toàn diện thông tin thành viên (họ tên, username, email, số điện thoại, địa chỉ, đổi mật khẩu mới) và khóa / mở khóa tài khoản.
- Quản lý loại sản phẩm: thêm mới, cập nhật tên, mô tả, tỷ lệ phần trăm lợi nhuận định mức, ẩn hoặc xóa loại.
- Quản lý danh mục sản phẩm: thêm sản phẩm mới, cập nhật thông tin hiển thị dữ liệu cũ, chỉnh sửa giá vốn, % lợi nhuận và ẩn/hiện sản phẩm.

### 4.4. Cổng quản trị vận hành (`admin-ops.html`)
- Quản lý nhập hàng: tạo phiếu nhập kho với chi tiết ngày nhập, số lượng và giá vốn từng mặt hàng; lưu phiếu nháp hoặc bấm hoàn thành để tự động cộng dồn tồn kho.
- Quản lý giá bán: điều chỉnh % lợi nhuận áp dụng theo loại sản phẩm hoặc tùy chỉnh riêng cho từng sản phẩm; tự động tính giá bán theo công thức `Giá bán = Giá vốn * (1 + % Lợi nhuận / 100)`.
- Quản lý đơn đặt hàng: tra cứu đơn hàng theo khoảng ngày và tình trạng (Mới đặt, Đã xử lý, Đã giao, Đã hủy); cập nhật trạng thái xử lý đơn.
- Tồn kho và báo cáo: danh sách cảnh báo sản phẩm có tồn kho thấp (dưới hoặc bằng 5 sản phẩm), tra cứu tồn kho theo phân loại và xuất bảng báo cáo Nhập - Xuất - Tồn theo khoảng thời gian.

---

## 5. Tài khoản mẫu kiểm thử

| Phân hệ | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| Quản trị viên (Admin) | `admin` | `admin123` | Quản trị toàn bộ các chức năng hệ thống và vận hành |
| Khách hàng | `khachhang1` | `123456` | Tài khoản thành viên đã có dữ liệu mẫu và đơn hàng |
| Khách hàng | `khachhang2` | `123456` | Tài khoản thành viên bổ sung |
| Khách hàng bị khóa | `khachhang_bi_khoa` | `123456` | Kiểm tra tính năng chặn đăng nhập đối với tài khoản bị khóa |

*Ghi chú: Tại thanh điều hướng quản trị có nút "Khôi phục dữ liệu mẫu" để đưa hệ thống về dữ liệu ban đầu khi cần thiết.*
