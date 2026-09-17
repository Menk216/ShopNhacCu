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
echo   Trang khách hàng:      http://127.0.0.1:5000
echo   Trang quản trị Admin:  http://127.0.0.1:5000/admin/login
echo.
echo   Tài khoản Admin:       admin / admin123
echo   Tài khoản Khách hàng:  khachhang1 / 123456
echo ===================================================
echo.
python app.py
pause
