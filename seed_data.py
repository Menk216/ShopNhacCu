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
        (1, 'GTR-YAM-F310', 'Đàn Guitar Acoustic Yamaha F310',
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Dòng guitar acoustic bán chạy hàng đầu cho người mới bắt đầu và biểu diễn acoustic. Mặt đàn gỗ vân sam nguyên tấm, âm thanh vang sáng, cần đàn êm tay.',
         2500000.0, 25.0, 'active', 46),
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
        (1, 'GTR-IBZ-GRG170', 'Đàn Guitar Điện Ibanez GRG170DX Gio',
         'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&auto=format&fit=crop&q=80',
         'Dòng guitar điện bán chạy nhất của Ibanez, trang bị cấu hình pickup HSH đa năng, cần đàn mỏng lướt phím tốc độ cao, phù hợp cho Rock và Metal.',
         4500000.0, 25.0, 'active', 12),
        (1, 'GTR-MAR-D28', 'Đàn Guitar Acoustic Martin D-28 Standard',
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Cây guitar dreadnought huyền thoại của Martin chế tác tại Mỹ, mặt gỗ vân sam Sitka già tuổi, lưng hông gỗ cẩm lai Ấn Độ cho dải âm dầy dặn uy lực.',
         68000000.0, 15.0, 'active', 3),
        (1, 'GTR-FEN-JAZZBASS', 'Đàn Guitar Bass Fender Player Jazz Bass',
         'https://images.unsplash.com/photo-1558098329-a11cff621064?w=600&auto=format&fit=crop&q=80',
         'Cây đàn bass 4 dây kinh điển với 2 pickup Single-coil Player Series, âm thanh dầy chắc, dải trung ấm áp, chuẩn mực cho mọi sân khấu biểu diễn.',
         17500000.0, 20.0, 'active', 5),
        (1, 'GTR-EPI-LESPAUL', 'Đàn Guitar Điện Epiphone Les Paul Standard 50s',
         'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
         'Tái hiện hoàn hảo phong cách thập niên 1950 với thân gỗ gụ đặc, nắp gỗ phong vân hổ, trang bị cặp pickup ProBucker cho tiếng đàn ngọt ngào và uy lực.',
         14200000.0, 22.0, 'active', 6),
        (2, 'PNO-ROL-FP30X', 'Đàn Piano Điện Roland FP-30X',
         'https://images.unsplash.com/photo-1520523839898-50712704043b?w=600&auto=format&fit=crop&q=80',
         'Trang bị nguồn âm thanh SuperNATURAL Piano và bàn phím PHA-4 chuẩn cơ mang lại cảm giác phím nặng chân thực, kết nối Bluetooth thông minh.',
         15500000.0, None, 'active', 8),
        (2, 'PNO-YAM-P45', 'Đàn Piano Điện Yamaha P-45B',
         'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&auto=format&fit=crop&q=80',
         'Thiết kế gọn gàng thanh lịch, công nghệ GHS tái hiện độ nặng phím chân thực, âm thanh đại dương cầm AWM sống động.',
         9800000.0, None, 'active', 11),
        (2, 'PNO-CAS-CTX700', 'Đàn Organ Keyboard Casio CT-X700',
         'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
         'Nguồn âm thanh AiX tái tạo trung thực âm sắc nhạc cụ mộc, 600 âm sắc phong phú và 195 điệu đệm, có cổng USB kết nối máy tính.',
         4100000.0, 25.0, 'active', 14),
        (2, 'PNO-KAW-K300', 'Đàn Piano Cơ Upright Kawai K-300 Nhật Bản',
         'https://images.unsplash.com/photo-1520523839898-50712704043b?w=600&auto=format&fit=crop&q=80',
         'Được bình chọn là cây đàn piano cơ của năm liên tiếp tại Nhật Bản, bộ máy cơ Millennium III làm từ sợi carbon siêu nhạy và bền bỉ, âm sắc vang rền sâu lắng.',
         135000000.0, 15.0, 'active', 2),
        (2, 'PNO-YAM-CLP735', 'Đàn Piano Điện Yamaha Clavinova CLP-735',
         'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&auto=format&fit=crop&q=80',
         'Lấy mẫu âm thanh từ 2 cây đại dương cầm hòa nhạc CFX và Bösendorfer Imperial lừng danh, bàn phím GrandTouch-S tái hiện chân thực độ nảy của phím gỗ.',
         38000000.0, 18.0, 'active', 4),
        (2, 'PNO-KOR-B2SP', 'Đàn Piano Điện Korg B2 SP Đầy Đủ Chân Pedal',
         'https://images.unsplash.com/photo-1571974599782-87624638275e?w=600&auto=format&fit=crop&q=80',
         'Mẫu piano điện gọn nhẹ với bộ khung chân gỗ và hệ 3 pedal vững chắc, bàn phím Natural Weighted Hammer Action (NH) trợ lực chuẩn cơ cho người mới học.',
         11800000.0, 20.0, 'active', 9),
        (2, 'PNO-YAM-SX900', 'Đàn Organ Điệu Chuyên Nghiệp Yamaha PSR-SX900',
         'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600&auto=format&fit=crop&q=80',
         'Dòng keyboard workstation cao cấp cho nhạc công biểu diễn đám cưới, sự kiện và phòng thu, màn hình cảm ứng màu 7 inch, hơn 1300 âm sắc và 500 điệu đệm.',
         34000000.0, 18.0, 'active', 5),
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
        (3, 'DRM-YAM-STAGE', 'Bộ Trống Cơ Yamaha Stage Custom Birch 5 Món',
         'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
         'Vỏ trống 100% gỗ bạch dương (Birch) cao cấp cho âm trầm chắc nịch và độ nảy cực nhạy, hệ thống cùm treo Tom YESS giữ nguyên độ cộng hưởng tự nhiên.',
         18500000.0, 25.0, 'active', 4),
        (3, 'DRM-ALE-NITRO', 'Bộ Trống Điện Tử Alesis Nitro Max Kit',
         'https://images.unsplash.com/photo-1543443436-1216a30141f2?w=600&auto=format&fit=crop&q=80',
         'Toàn bộ mặt lưới thế hệ mới đường kính lớn, tích hợp kết nối Bluetooth phát nhạc đệm từ điện thoại, hơn 400 âm thanh chất lượng phòng thu BFD.',
         9900000.0, 25.0, 'active', 8),
        (3, 'DRM-MEI-CAJON', 'Trống Cajon Meinl Snarecraft SC100AB',
         'https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=600&auto=format&fit=crop&q=80',
         'Trống cajon thùng gỗ bạch dương Baltic, tích hợp hệ thống dây tem snare bên trong, âm bass nén uy lực và tiếng snare đanh gọn khi đệm hát acoustic.',
         2450000.0, 30.0, 'active', 16),
        (3, 'DRM-TYC-BONGO', 'Bộ Trống Bongo Tycoon Percussion 7 & 8.5 Inch',
         'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
         'Thân gỗ sồi Siam thân thiện môi trường, mặt da trâu tự nhiên được xử lý cao cấp cho âm cao sắc nét và tiếng vỗ chắc khỏe đậm chất Latin.',
         2100000.0, 30.0, 'active', 11),
        (4, 'VLN-YAM-V5SC', 'Đàn Violin Yamaha V5SC 4/4 Full Size',
         'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80',
         'Chế tác thủ công hoàn toàn từ gỗ vân sam và phong sấy tự nhiên, hoàn thiện bằng lớp véc-ni bóng bẩy, đi kèm vĩ kéo và hộp đựng cao cấp.',
         8500000.0, None, 'active', 8),
        (4, 'VLN-EAS-VC100', 'Đàn Cello Eastman Samuel Eastman VC100',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Cây Cello tuyệt tác dành cho học sinh trung cấp và nhạc công bán chuyên, tiếng bass trầm ấm đầy uy quyền và biểu cảm.',
         22000000.0, 20.0, 'active', 8),
        (4, 'VLN-SUZ-220', 'Đàn Violin Suzuki 220 4/4 Nhật Bản',
         'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80',
         'Thương hiệu vĩ cầm mẫu mực được khuyên dùng tại mọi nhạc viện trên thế giới, gia công tỉ mỉ từng chi tiết, âm thanh sáng rõ và chuẩn xác từng nốt.',
         9800000.0, 22.0, 'active', 6),
        (4, 'VLN-SCO-STV017', 'Đàn Violin Scott Cao STV-017 Gỗ Mun Thủ Công',
         'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
         'Chế tác bởi xưởng nghệ nhân Scott Cao danh tiếng, phím đàn bằng gỗ mun (Ebony) nguyên khối, âm sắc cổ điển ngọt ngào bay bổng.',
         14500000.0, 20.0, 'active', 5),
        (4, 'STR-FEN-VENICE', 'Đàn Ukulele Fender Venice Soprano',
         'https://images.unsplash.com/photo-1588731234159-8b9963143fca?w=600&auto=format&fit=crop&q=80',
         'Dáng đàn Soprano nhỏ gọn mang phong cách biển Venice California, đầu đàn kiểu Telecaster độc quyền từ Fender, âm thanh vui tươi rộn rã.',
         1650000.0, 25.0, 'active', 20),
        (4, 'STR-YAM-VA5S', 'Đàn Viola Yamaha VA5S 16 Inch Thủ Công',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Thân đàn kích thước 16 inch tiêu chuẩn hòa nhạc, gỗ chọn lọc tự nhiên trên 5 năm tuổi, âm vực trung trầm ấm áp và biểu cảm vượt trội.',
         12000000.0, 22.0, 'active', 4),
        (5, 'WND-YAM-YFL222', 'Kèn Sáo Flute Yamaha YFL-222 Chuẩn Học Tập',
         'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=600&auto=format&fit=crop&q=80',
         'Thân kèn mạ bạc nickel sáng bóng bền bỉ, lỗ bấm khép kín (closed-hole), phản hồi âm thanh nhanh và dễ thổi ngay cả cho người mới bắt đầu.',
         11200000.0, None, 'active', 7),
        (5, 'WND-YAM-YAS280', 'Kèn Saxophone Alto Yamaha YAS-280',
         'https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&auto=format&fit=crop&q=80',
         'Kèn Alto Saxophone tiêu chuẩn vàng thế giới, cơ chế phím bấm mượt mà chính xác, tạo âm sắc ấm áp và chuẩn ngữ điệu.',
         24500000.0, 20.0, 'active', 3),
        (5, 'WND-HOH-SILVER', 'Kèn Harmonica Hohner Silver Star Diatonic C',
         'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
         'Harmonica 10 lỗ giọng Đô (Key C) từ thương hiệu lừng danh Hohner Đức, nắp ốp inox không rỉ, âm thanh trong trẻo linh hoạt.',
         320000.0, 40.0, 'active', 24),
        (5, 'WND-YAM-YTR2330', 'Kèn Trumpet Yamaha YTR-2330 Đồng Vàng',
         'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
         'Kèn Trumpet bán chạy hàng đầu thế giới cho học viên và ban nhạc diễu hành, loa kèn bằng đồng vàng 2 mảnh cho phản hồi âm thanh nhẹ nhàng chuẩn xác.',
         12800000.0, 22.0, 'active', 5),
        (5, 'WND-YAM-YCL255', 'Kèn Clarinet Yamaha YCL-255 Thân Nhựa ABS',
         'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=600&auto=format&fit=crop&q=80',
         'Thiết kế thân nhựa ABS bền chắc không sợ ẩm mốc hay nứt nẻ, phím mạ niken nhạy bén, âm sắc ấm áp và độ ổn định cao.',
         13500000.0, 22.0, 'active', 6),
        (5, 'WND-YAM-P37D', 'Kèn Melodica Pianica Yamaha P-37D 37 Phím',
         'https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&auto=format&fit=crop&q=80',
         'Dải âm rộng 3 quãng tám đầy đủ 37 phím bấm, lá đồng chống gỉ cho âm thanh sắc bén, tặng kèm ống thổi mềm và hộp đựng bảo vệ.',
         1350000.0, 28.0, 'active', 25),
        (5, 'WND-TRU-DIZI', 'Sáo Trúc Dizi Khớp Nối Kép Chuyên Nghiệp Tone C/D',
         'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
         'Làm từ trúc đắng đồi cao tuổi từ 5 năm trở lên, khớp nối đồng kép chuẩn xác, âm sắc trong trẻo mượt mà, đầy đủ màng rung và dây treo cát tường.',
         450000.0, 35.0, 'active', 35),
        (6, 'ACC-KOR-TM60', 'Máy Đập Nhịp & Lên Dây Korg TM-60 Combo',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Màn hình LCD lớn hiển thị rõ ràng, tích hợp cùng lúc Tuner đo cao độ chuẩn xác và Metronome đập nhịp tiện lợi.',
         680000.0, None, 'active', 30),
        (6, 'ACC-DAD-EJ16', "Bộ Dây Đàn Guitar Acoustic D'Addario EJ16",
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Dây Phosphor Bronze chính hãng sản xuất tại Mỹ, âm sắc ấm vang cân bằng hoàn hảo, độ bền dây vượt trội.',
         185000.0, 50.0, 'active', 44),
        (6, 'ACC-HER-STAND', 'Chân Đàn Guitar Tự Khóa Hercules GS414B Plus',
         'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
         'Cơ chế Auto Grip System (AGS) tự động kẹp giữ cần đàn chắc chắn và an toàn tuyệt đối chống rơi đổ.',
         790000.0, None, 'active', 17),
        (6, 'ACC-KYS-QUICK', 'Kẹp Capo Đàn Guitar Kyser Quick-Change USA',
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Sản xuất thủ công tại Texas Mỹ, lực kẹp cao su đệm đều các dây đàn không gây rè hay biến dạng cao độ, thao tác chuyển phím bằng một tay cực nhanh.',
         380000.0, 40.0, 'active', 50),
        (6, 'ACC-DUN-PICK12', 'Hộp 12 Phím Gảy Guitar Dunlop Tortex Standard 0.73mm',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Chất liệu Tortex độc quyền từ Dunlop mang lại cảm giác cầm bám tay tối đa, độ đàn hồi hoàn hảo cho cả tỉa nốt solo và quạt chả acoustic.',
         150000.0, 45.0, 'active', 80),
        (6, 'ACC-FEN-STRAP', 'Dây Đeo Đàn Guitar Vải Tweed Cổ Điển Fender',
         'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
         'Bề mặt vải dệt Tweed vàng nâu vintage sang trọng, đầu dây da bò thật dập nổi logo Fender F kinh điển, êm vai khi đứng biểu diễn nhiều giờ.',
         420000.0, 35.0, 'active', 35),
        (6, 'ACC-MON-CABLE', 'Dây Cáp Nhạc Cụ Chống Nhiễu Monster Prolink Studio 3m',
         'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
         'Lõi đồng OFC tinh khiết 99.99%, đầu jack 6.5mm mạ vàng 24K chống oxy hóa, lớp bọc lưới dù dẻo dai triệt tiêu 100% tiếng xì nhiễu tín hiệu âm thanh.',
         580000.0, 35.0, 'active', 25),
        (6, 'ACC-BOS-DS1', 'Phơ Bàn Đạp Guitar Boss DS-1 Distortion Nhập Khẩu Nhật',
         'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
         'Cục phơ méo tiếng huyền thoại xuất hiện trong hàng triệu album nhạc Rock từ năm 1978 đến nay, độ bền nồi đồng cối đá từ thương hiệu Boss Roland.',
         1450000.0, 25.0, 'active', 14),
        (6, 'ACC-VIC-5A', 'Cặp Dùi Trống Gỗ Hickory Vic Firth American Classic 5A',
         'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
         'Gỗ hồ đào (Hickory) sấy chọn lọc tại Mỹ với độ cân bằng tuyệt hảo giữa 2 thanh, đầu dùi hình giọt nước tạo âm cymbal trong trẻo và tiếng snare uy lực.',
         240000.0, 40.0, 'active', 60),
        (6, 'ACC-EVA-SOFF', 'Bộ Pad Giảm Âm Trống Toàn Diện Evans SoundOff 5 Món',
         'https://images.unsplash.com/photo-1543443436-1216a30141f2?w=600&auto=format&fit=crop&q=80',
         'Giảm âm lượng bộ trống cơ đến 95% giúp tập luyện thoải mái trong phòng ngủ mà không làm phiền hàng xóm, giữ nguyên độ nảy chân thực của mặt trống.',
         1250000.0, 30.0, 'active', 12),
        (6, 'ACC-ROL-DP10', 'Bàn Đạp Vang Tiếng Roland DP-10 Damper Pedal',
         'https://images.unsplash.com/photo-1520523839898-50712704043b?w=600&auto=format&fit=crop&q=80',
         'Pedal hỗ trợ tính năng nửa bàn đạp (Half-pedaling) tạo sắc thái biểu cảm sâu sắc như đại dương cầm, mặt dưới có tấm cao su chống trượt trên sàn gạch.',
         890000.0, 30.0, 'active', 20),
        (6, 'ACC-ATH-M20X', 'Tai Nghe Kiểm Âm Phòng Thu Audio-Technica ATH-M20x',
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
         'Màng loa 40mm với nam châm đất hiếm tái hiện dải tần trung thực chuẩn phòng thu, cách âm cực tốt, hoàn hảo khi cắm đàn Piano điện và Trống điện tử.',
         1150000.0, 28.0, 'active', 18),
        (6, 'ACC-PIR-ROSIN', 'Hộp Nhựa Thông Vĩ Kéo Pirastro Goldflex Cho Violin & Cello',
         'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80',
         'Nhựa thông cao cấp sản xuất tại Đức pha trộn bột vàng lá li ti, giúp lông vĩ bám dây nhạy bén, tạo âm thanh mượt mà ấm áp không bị bụi bẩn.',
         280000.0, 40.0, 'active', 45),
        (6, 'ACC-THO-DOM135', 'Bộ Dây Đàn Violin Thomastik-Infeld Dominant 135B 4/4',
         'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
         'Bộ dây vĩ cầm được ưa chuộng nhất thế giới sản xuất tại Áo, lõi sợi tổng hợp đa sợi linh hoạt, âm sắc tròn đầy ấm áp tương tự dây ruột cừu truyền thống.',
         950000.0, 30.0, 'active', 22),
        (6, 'ACC-DUN-CLEAN', 'Bộ Vệ Sinh & Dưỡng Gỗ Đàn Guitar Dunlop 65 System',
         'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
         'Gồm 1 chai xịt làm sạch bóng sơn Body, 1 chai dầu dưỡng mặt phím Fretboard và khăn lau vi sợi Microfiber cao cấp, bảo vệ nhạc cụ luôn như mới.',
         360000.0, 35.0, 'active', 40),
        (6, 'ACC-SOUN-STAND', 'Giá Để Sách Nhạc Kim Loại Gấp Gọn Soundking DF008',
         'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
         'Kết cấu thép carbon chịu lực sơn tĩnh điện đen nhám, tùy chỉnh chiều cao linh hoạt, đi kèm kẹp giữ trang bản nhạc và túi xách du lịch tiện lợi.',
         260000.0, 40.0, 'active', 30),
        (6, 'ACC-BAG-GTR5', 'Bao Da Đàn Guitar 5 Lớp Chống Nước Chống Va Đập',
         'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
         'Vải Oxford 1680D chống thấm nước tuyệt đối, lớp đệm mút xốp dày 25mm êm ái bảo vệ tối đa thân và cần đàn khi đi xe máy, có gối đỡ cần và 2 quai đeo êm vai.',
         480000.0, 35.0, 'active', 28),
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
