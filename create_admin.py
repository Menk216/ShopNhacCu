import sys
import database
from werkzeug.security import generate_password_hash

# Đảm bảo in tiếng Việt chuẩn trên Command Prompt / PowerShell của Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stdin.reconfigure(encoding='utf-8')
    except Exception:
        pass

def create_admin(username=None, password=None, full_name=None, email=None):
    database.init_db()
    
    print("===================================================")
    print("      CONG CU TAO TAI KHOAN ADMIN - MELODY STORE   ")
    print("===================================================")

    if not username:
        username = input("1. Nhập tên đăng nhập Admin: ").strip()
    if not password:
        password = input("2. Nhập mật khẩu Admin: ").strip()
    if not full_name:
        full_name = input("3. Nhập họ tên Quản trị viên (mặc định: Quản Trị Viên): ").strip() or "Quản Trị Viên"
    if not email:
        email = input("4. Nhập email (tùy chọn): ").strip()

    if not username or not password:
        print("\n[LỖI] Tên đăng nhập và mật khẩu không được để trống!")
        return

    conn = database.get_db_connection()
    existing = conn.execute("SELECT id, role, username FROM users WHERE username = ?", (username,)).fetchone()
    
    if existing:
        if existing['role'] == 'admin':
            print(f"\n[THÔNG BÁO] Tài khoản '{username}' đã tồn tại và đang có quyền Admin.")
            choice = input("Bạn có muốn đổi mật khẩu cho tài khoản này không? (y/n): ")
            if choice.lower() == 'y':
                conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(password), existing['id']))
                conn.commit()
                print(f"[THÀNH CÔNG] Đã cập nhật mật khẩu mới cho admin '{username}'!")
        else:
            print(f"\n[THÔNG BÁO] Tài khoản '{username}' đang tồn tại với vai trò Khách hàng.")
            choice = input("Bạn có muốn nâng cấp tài khoản này lên quyền Admin không? (y/n): ")
            if choice.lower() == 'y':
                conn.execute("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?", (generate_password_hash(password), existing['id']))
                conn.commit()
                print(f"[THÀNH CÔNG] Đã nâng cấp '{username}' lên quyền Admin thành công!")
        conn.close()
        return

    password_hash = generate_password_hash(password)
    conn.execute('''
        INSERT INTO users (username, password_hash, full_name, email, role, status)
        VALUES (?, ?, ?, ?, 'admin', 'active')
    ''', (username, password_hash, full_name, email))
    conn.commit()
    conn.close()

    print("\n---------------------------------------------------")
    print(f"✔ ĐÃ TẠO TÀI KHOẢN ADMIN '{username}' THÀNH CÔNG!")
    print("---------------------------------------------------")
    print("Bây giờ bạn có thể đăng nhập ngay tại:")
    print("👉 Trang đăng nhập: http://127.0.0.1:5000/admin/login")
    print(f"👉 Tài khoản:       {username}")
    print(f"👉 Mật khẩu:        {password}")
    print("===================================================\n")

if __name__ == '__main__':
    u = sys.argv[1] if len(sys.argv) > 1 else None
    p = sys.argv[2] if len(sys.argv) > 2 else None
    name = sys.argv[3] if len(sys.argv) > 3 else None
    email = sys.argv[4] if len(sys.argv) > 4 else None
    create_admin(u, p, name, email)
