@echo off
chcp 65001 > nul
echo ===================================================
echo     MELODY STORE - WEB BÁN DỤNG CỤ ÂM NHẠC
echo ===================================================
echo.
echo Đang kiểm tra thư viện và khởi tạo cơ sở dữ liệu...
python -m pip install -r requirements.txt
python seed_data.py
echo.
echo ===================================================
echo   Máy chủ đang chạy tại: http://127.0.0.1:5000
echo.
echo   4 TRANG HTML CHÍNH CỦA ĐỒ ÁN:
echo   1. Trang chủ & Tìm kiếm:   http://127.0.0.1:5000/index.html
echo   2. Khách hàng & Đơn hàng:  http://127.0.0.1:5000/customer.html
echo   3. Quản trị & Sản phẩm:    http://127.0.0.1:5000/admin.html
echo   4. Nhập hàng & Tồn kho:    http://127.0.0.1:5000/admin-ops.html
echo.
echo   (Có thể mở trực tiếp 4 file HTML trên bằng trình duyệt Chrome mà không cần bật máy chủ)
echo.
echo   Tài khoản Admin:       admin / admin123
echo   Tài khoản Khách hàng:  khachhang1 / 123456
echo ===================================================
echo.
python app.py
pause
