import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import database

def seed_database():
    database.init_db()
    conn = database.get_db_connection()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        print("Database already seeded. Skipping initial seed.")
        conn.close()
        return

    print("Seeding initial musical store data...")

    # 1. Seed Users
    users_data = [
        ('admin', generate_password_hash('admin123'), 'Quản Trị Viên', 'admin@musicstore.vn', '0909000999', 'Số 1 Phố Nhạc Cụ, Hà Nội', 'admin', 'active'),
        ('khachhang1', generate_password_hash('123456'), 'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0912345678', '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM', 'customer', 'active'),
        ('khachhang2', generate_password_hash('123456'), 'Trần Thị Mai', 'tranmai@gmail.com', '0987654321', '45 Hai Bà Trưng, Phường Tràng Tiền, Hoàn Kiếm, Hà Nội', 'customer', 'active'),
        ('khachhang_bi_khoa', generate_password_hash('123456'), 'Lê Khóa Tài Khoản', 'lekhoa@gmail.com', '0933445566', '88 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'customer', 'locked'),
    ]
    cursor.executemany('''
        INSERT INTO users (username, password_hash, full_name, email, phone, address, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', users_data)

    # 2. Seed Categories
    categories_data = [
        ('GUITAR', 'Đàn Guitar', 'Các loại đàn Guitar Acoustic, Classic, Electric và Bass chính hãng chất lượng cao', 'active', 25.0),
        ('PIANO', 'Đàn Piano & Keyboard', 'Piano điện, Piano cơ acoustic và đàn Organ Keyboard cho mọi trình độ', 'active', 20.0),
        ('DRUMS', 'Trống & Bộ Gõ', 'Bộ trống cơ chuyên nghiệp, trống điện tử thông minh và cymbals đa dạng', 'active', 30.0),
        ('VIOLIN', 'Đàn Violin & Nhạc Cụ Dây', 'Violin, Viola, Cello thủ công tuyển chọn âm thanh mộc mạc tinh tế', 'active', 22.0),
        ('WIND', 'Nhạc Cụ Hơi (Kèn & Sáo)', 'Saxophone, Flute, Clarinet, Harmonica và các loại sáo chất lượng cao', 'active', 25.0),
        ('ACC', 'Phụ Kiện Âm Nhạc', 'Dây đàn, chân đàn, bao da, máy đập nhịp, bộ lau chùi bảo dưỡng nhạc cụ', 'active', 35.0),
    ]
    cursor.executemany('''
        INSERT INTO categories (code, name, description, status, profit_margin_percent)
        VALUES (?, ?, ?, ?, ?)
    ''', categories_data)

    # 3. Seed Products
    # Products mapped to categories by category_id (1: GUITAR, 2: PIANO, 3: DRUMS, 4: VIOLIN, 5: WIND, 6: ACC)
    products_data = [
        # Guitar (category 1)
        (1, 'GTR-YAM-F310', 'Đàn Guitar Acoustic Yamaha F310', 
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Dòng guitar acoustic bán chạy hàng đầu cho người mới bắt đầu và biểu diễn acoustic. Mặt đàn gỗ vân sam nguyên tấm, âm thanh vang sáng, cần đàn êm tay.',
         2500000.0, None, 'active', 15),
        (1, 'GTR-FEN-STRAT', 'Đàn Guitar Điện Fender Player Stratocaster', 
         'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
         'Cây đàn huyền thoại dòng Stratocaster đến từ Fender với 3 pickup đơn kinh điển, cần gỗ phong mượt mà, phù hợp mọi phong cách Rock, Pop, Blues.',
         16000000.0, 22.0, 'active', 6),
        (1, 'GTR-COR-C40', 'Đàn Guitar Classic Cordoba C1M', 
         'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
         'Guitar cổ điển dây nilon, dáng truyền thống, âm thanh ấm áp sâu lắng, rất phù hợp cho học tập trường nhạc và trình diễn nhạc cổ điển.',
         3200000.0, None, 'active', 10),
        (1, 'GTR-TAY-214CE', 'Đàn Guitar Acoustic Taylor 214ce Deluxe', 
         'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
         'Dáng Grand Auditorium danh tiếng của Taylor, tích hợp EQ ES2 cao cấp truyền tải âm thanh tự nhiên nhất khi cắm ampli biểu diễn sân khấu.',
         26000000.0, 18.0, 'active', 4),

        # Piano (category 2)
        (2, 'PNO-ROL-FP30X', 'Đàn Piano Điện Roland FP-30X', 
         'https://images.unsplash.com/photo-1520523839898-50712704043b?w=600&auto=format&fit=crop&q=80',
         'Trang bị nguồn âm thanh SuperNATURAL Piano và bàn phím PHA-4 chuẩn cơ mang lại cảm giác phím nặng chân thực, kết nối Bluetooth thông minh.',
         15500000.0, None, 'active', 8),
        (2, 'PNO-YAM-P45', 'Đàn Piano Điện Yamaha P-45B', 
         'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&auto=format&fit=crop&q=80',
         'Thiết kế gọn gàng thanh lịch, công nghệ GHS tái hiện độ nặng phím chân thực, âm thanh đại dương cầm AWM sống động.',
         9800000.0, None, 'active', 12),
        (2, 'PNO-CAS-CTX700', 'Đàn Organ Keyboard Casio CT-X700', 
         'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
         'Nguồn âm thanh AiX tái tạo trung thực âm sắc nhạc cụ mộc, 600 âm sắc phong phú và 195 điệu đệm, có cổng USB kết nối máy tính.',
         4100000.0, 25.0, 'active', 14),

        # Drums (category 3)
        (3, 'DRM-PEA-ROAD', 'Bộ Trống Cơ Pearl Roadshow RS525SC', 
         'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
         'Bộ trống 5 món tiêu chuẩn quốc tế từ hãng Pearl lừng danh, vỏ gỗ bạch dương 9 lớp dầy dặn, âm thanh uy lực, đi kèm cymbals và ghế ngồi.',
         13200000.0, None, 'active', 5),
        (3, 'DRM-ROL-TD1DMK', 'Bộ Trống Điện Tử Roland TD-1DMK', 
         'https://images.unsplash.com/photo-1543443436-1216a30141f2?w=600&auto=format&fit=crop&q=80',
         'Toàn bộ mặt pad bằng lưới kép (mesh head) cao cấp cho cảm giác gõ như trống thật và độ ồn cực thấp khi tập luyện tại gia đình với tai nghe.',
         16500000.0, 25.0, 'active', 7),
        (3, 'DRM-MEI-HCS', 'Bộ Lá Cymbals Meinl HCS Bronze Complete', 
         'https://images.unsplash.com/photo-1571327073757-71d13c1459ee?w=600&auto=format&fit=crop&q=80',
         'Sản xuất tại Đức từ hợp kim đồng B8 cao cấp, độ bền vượt trội, âm thanh sắc nét sáng rõ trong từng nhịp gõ.',
         5600000.0, None, 'active', 9),

        # Violin (category 4)
        (4, 'VLN-YAM-V5SC', 'Đàn Violin Yamaha V5SC 4/4 Full Size', 
         'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80',
         'Chế tác thủ công hoàn toàn từ gỗ vân sam và phong sấy tự nhiên, hoàn thiện bằng lớp véc-ni bóng bẩy, đi kèm vĩ kéo và hộp đựng cao cấp.',
         8500000.0, None, 'active', 8),
        (4, 'VLN-EAS-VC100', 'Đàn Cello Eastman Samuel Eastman VC100', 
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Cây Cello tuyệt tác dành cho học sinh trung cấp và nhạc công bán chuyên, tiếng bass trầm ấm đầy uy quyền và biểu cảm.',
         22000000.0, 20.0, 'active', 3),

        # Wind Instruments (category 5)
        (5, 'WND-YAM-YFL222', 'Kèn Sáo Flute Yamaha YFL-222 Chuẩn Học Tập', 
         'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=600&auto=format&fit=crop&q=80',
         'Thân kèn mạ bạc nickel sáng bóng bền bỉ, lỗ bấm khép kín (closed-hole), phản hồi âm thanh nhanh và dễ thổi ngay cả cho người mới bắt đầu.',
         11200000.0, None, 'active', 7),
        (5, 'WND-YAM-YAS280', 'Kèn Saxophone Alto Yamaha YAS-280', 
         'https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&auto=format&fit=crop&q=80',
         'Kèn Alto Saxophone tiêu chuẩn vàng thế giới, cơ chế phím bấm mượt mà chính xác, tạo âm sắc ấm áp và chuẩn ngữ điệu.',
         24500000.0, 20.0, 'active', 4),
        (5, 'WND-HOH-SILVER', 'Kèn Harmonica Hohner Silver Star Diatonic C', 
         'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
         'Harmonica 10 lỗ giọng Đô (Key C) từ thương hiệu lừng danh Hohner Đức, nắp ốp inox không rỉ, âm thanh trong trẻo linh hoạt.',
         320000.0, 40.0, 'active', 25),

        # Accessories (category 6)
        (6, 'ACC-KOR-TM60', 'Máy Đập Nhịp & Lên Dây Korg TM-60 Combo', 
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Màn hình LCD lớn hiển thị rõ ràng, tích hợp cùng lúc Tuner đo cao độ chuẩn xác và Metronome đập nhịp tiện lợi.',
         680000.0, None, 'active', 30),
        (6, 'ACC-DAD-EJ16', 'Bộ Dây Đàn Guitar Acoustic D\'Addario EJ16', 
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Dây Phosphor Bronze chính hãng sản xuất tại Mỹ, âm sắc ấm vang cân bằng hoàn hảo, độ bền dây vượt trội.',
         185000.0, 50.0, 'active', 45),
        (6, 'ACC-HER-STAND', 'Chân Đàn Guitar Tự Khóa Hercules GS414B Plus', 
         'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
         'Cơ chế Auto Grip System (AGS) tự động kẹp giữ cần đàn chắc chắn và an toàn tuyệt đối chống rơi đổ.',
         790000.0, None, 'active', 18),
    ]

    cursor.executemany('''
        INSERT INTO products (category_id, code, name, image_url, description, cost_price, profit_margin_percent, status, stock_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products_data)

    # 4. Seed Import Receipts (Phiếu nhập hàng)
    # Receipt 1: Completed 15 days ago
    date_15_days_ago = (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO import_receipts (receipt_code, import_date, status, total_cost, notes)
        VALUES (?, ?, 'completed', ?, ?)
    ''', ('PN-2026-001', date_15_days_ago, 78500000.0, 'Nhập lô hàng Guitar Yamaha và Roland Piano phục vụ mùa tựu trường'))
    receipt_1_id = cursor.lastrowid

    # Items for Receipt 1
    cursor.executemany('''
        INSERT INTO import_receipt_items (receipt_id, product_id, import_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (receipt_1_id, 1, 2500000.0, 10, 25000000.0),  # Yamaha F310
        (receipt_1_id, 5, 15500000.0, 3, 46500000.0),  # Roland FP-30X
        (receipt_1_id, 17, 140000.0, 50, 7000000.0),   # D'Addario EJ16
    ])

    # Receipt 2: Completed 5 days ago
    date_5_days_ago = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO import_receipts (receipt_code, import_date, status, total_cost, notes)
        VALUES (?, ?, 'completed', ?, ?)
    ''', ('PN-2026-002', date_5_days_ago, 52100000.0, 'Nhập bổ sung bộ trống Pearl và kèn Alto Saxophone'))
    receipt_2_id = cursor.lastrowid

    cursor.executemany('''
        INSERT INTO import_receipt_items (receipt_id, product_id, import_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (receipt_2_id, 8, 13200000.0, 2, 26400000.0),  # Pearl Roadshow
        (receipt_2_id, 14, 24500000.0, 1, 24500000.0), # Saxophone YAS-280
        (receipt_2_id, 18, 600000.0, 2, 1200000.0),    # Hercules Stand
    ])

    # Receipt 3: Draft (bản nháp - để admin test sửa và bấm Hoàn thành)
    today_str = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO import_receipts (receipt_code, import_date, status, total_cost, notes)
        VALUES (?, ?, 'draft', ?, ?)
    ''', ('PN-2026-003', today_str, 29200000.0, 'Phiếu nháp: Nhập Violin và Đàn Classic dự kiến giao cuối tuần'))
    receipt_3_id = cursor.lastrowid

    cursor.executemany('''
        INSERT INTO import_receipt_items (receipt_id, product_id, import_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?)
    ''', [
        (receipt_3_id, 3, 3200000.0, 4, 12800000.0),   # Cordoba C1M
        (receipt_3_id, 11, 8200000.0, 2, 16400000.0),  # Yamaha Violin V5SC
    ])

    # 5. Seed Orders (Đơn đặt hàng)
    # Order 1: Delivered (đã giao 7 ngày trước)
    date_7_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
        INSERT INTO orders (order_code, user_id, recipient_name, recipient_phone, recipient_address, payment_method, payment_status, order_status, total_amount, notes, created_at)
        VALUES (?, 2, ?, ?, ?, 'cod', 'paid', 'delivered', ?, ?, ?)
    ''', ('DH-2026-001', 'Nguyễn Văn An', '0912345678', '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM', 4000000.0, 'Giao giờ hành chính', date_7_days_ago))
    order_1_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, 1, 'Đàn Guitar Acoustic Yamaha F310', 3125000.0, 1, 3125000.0)
    ''', (order_1_id,))
    cursor.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, 17, 'Bộ Dây Đàn Guitar Acoustic D''Addario EJ16', 278000.0, 3, 834000.0)
    ''', (order_1_id,))

    # Order 2: Processing (đã xử lý 2 ngày trước)
    date_2_days_ago = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
        INSERT INTO orders (order_code, user_id, recipient_name, recipient_phone, recipient_address, payment_method, payment_status, order_status, total_amount, notes, created_at)
        VALUES (?, 3, ?, ?, ?, 'bank_transfer', 'paid', 'processing', ?, ?, ?)
    ''', ('DH-2026-002', 'Trần Thị Mai', '0987654321', '45 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', 18600000.0, 'Đóng gói cẩn thận giúp tôi', date_2_days_ago))
    order_2_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, 5, 'Đàn Piano Điện Roland FP-30X', 18600000.0, 1, 18600000.0)
    ''', (order_2_id,))

    # Order 3: Pending (mới đặt hôm nay)
    cursor.execute('''
        INSERT INTO orders (order_code, user_id, recipient_name, recipient_phone, recipient_address, payment_method, payment_status, order_status, total_amount, notes, created_at)
        VALUES (?, 2, ?, ?, ?, 'cod', 'unpaid', 'pending', ?, ?, CURRENT_TIMESTAMP)
    ''', ('DH-2026-003', 'Nguyễn Văn An', '0912345678', 'Chung cư Sunrise City, Quận 7, TP.HCM', 1067000.0, 'Giao cuối tuần'))
    order_3_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, 18, 'Chân Đàn Guitar Tự Khóa Hercules GS414B Plus', 1067000.0, 1, 1067000.0)
    ''', (order_3_id,))

    # Order 4: Cancelled (đã hủy)
    date_10_days_ago = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
        INSERT INTO orders (order_code, user_id, recipient_name, recipient_phone, recipient_address, payment_method, payment_status, order_status, total_amount, notes, created_at)
        VALUES (?, 3, ?, ?, ?, 'online', 'unpaid', 'cancelled', ?, ?, ?)
    ''', ('DH-2026-004', 'Trần Thị Mai', '0987654321', '45 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', 5125000.0, 'Khách đổi ý muốn mua đàn điện', date_10_days_ago))
    order_4_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, 7, 'Đàn Organ Keyboard Casio CT-X700', 5125000.0, 1, 5125000.0)
    ''', (order_4_id,))

    conn.commit()
    conn.close()
    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
