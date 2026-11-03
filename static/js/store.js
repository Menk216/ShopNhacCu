/**
 * Melody Store - Shared Client-Side Database & State Management
 * Chạy 100% trên Local Browser (file:// hoặc http://) thông qua localStorage.
 * Đảm bảo dữ liệu đồng bộ tức thì giữa cả 4 file HTML:
 * index.html, customer.html, admin.html, admin-ops.html
 */

(function (window) {
  'use strict';

  const STORAGE_PREFIX = 'melodystore_v3_';

  // Dữ liệu mẫu chuẩn từ cơ sở dữ liệu nhạc cụ
  const DEFAULT_CATEGORIES = [
    { id: 1, code: 'GUITAR', name: 'Đàn Guitar', description: 'Các loại đàn Guitar Acoustic, Classic, Electric và Bass chính hãng', status: 'active', profit_margin: 25.0 },
    { id: 2, code: 'PIANO', name: 'Đàn Piano & Keyboard', description: 'Piano điện, Piano cơ acoustic và đàn Organ Keyboard cho mọi trình độ', status: 'active', profit_margin: 20.0 },
    { id: 3, code: 'DRUMS', name: 'Trống & Bộ Gõ', description: 'Bộ trống cơ chuyên nghiệp, trống điện tử thông minh và cymbals đa dạng', status: 'active', profit_margin: 30.0 },
    { id: 4, code: 'VIOLIN', name: 'Đàn Violin & Nhạc Cụ Dây', description: 'Violin, Viola, Cello thủ công tuyển chọn âm thanh mộc mạc tinh tế', status: 'active', profit_margin: 22.0 },
    { id: 5, code: 'WIND', name: 'Nhạc Cụ Hơi (Kèn & Sáo)', description: 'Saxophone, Flute, Clarinet, Harmonica và các loại sáo chất lượng cao', status: 'active', profit_margin: 25.0 },
    { id: 6, code: 'ACC', name: 'Phụ Kiện Âm Nhạc', description: 'Dây đàn, chân đàn, bao da, máy đập nhịp, bộ bảo dưỡng nhạc cụ', status: 'active', profit_margin: 35.0 }
  ];

  const DEFAULT_PRODUCTS = [
    {
      id: 1, category_id: 1, code: 'GTR-YAM-F310', name: 'Đàn Guitar Acoustic Yamaha F310',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
      description: 'Dòng guitar acoustic bán chạy hàng đầu cho người mới bắt đầu và đệm hát acoustic. Mặt đàn gỗ vân sam nguyên tấm, âm thanh vang sáng, cần đàn êm tay.',
      cost_price: 2500000, margin: null, status: 'active', stock: 15
    },
    {
      id: 2, category_id: 1, code: 'GTR-FEN-STRAT', name: 'Đàn Guitar Điện Fender Player Stratocaster',
      image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80',
      description: 'Cây đàn huyền thoại dòng Stratocaster đến từ Fender với 3 pickup đơn kinh điển, cần gỗ phong mượt mà, phù hợp mọi phong cách Rock, Pop, Blues.',
      cost_price: 16000000, margin: 22.0, status: 'active', stock: 6
    },
    {
      id: 3, category_id: 1, code: 'GTR-COR-C1M', name: 'Đàn Guitar Classic Cordoba C1M',
      image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
      description: 'Guitar cổ điển dây nilon, dáng truyền thống, âm thanh ấm áp sâu lắng, rất phù hợp cho học tập trường nhạc và biểu diễn nhạc cổ điển.',
      cost_price: 3200000, margin: null, status: 'active', stock: 10
    },
    {
      id: 4, category_id: 1, code: 'GTR-TAY-214CE', name: 'Đàn Guitar Acoustic Taylor 214ce Deluxe',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      description: 'Dáng Grand Auditorium danh tiếng của Taylor, tích hợp EQ ES2 cao cấp truyền tải âm thanh tự nhiên nhất khi cắm ampli biểu diễn sân khấu.',
      cost_price: 26000000, margin: 18.0, status: 'active', stock: 4
    },
    {
      id: 5, category_id: 2, code: 'PNO-ROL-FP30X', name: 'Đàn Piano Điện Roland FP-30X',
      image: 'https://images.unsplash.com/photo-1520523839898-50712704043b?w=600&auto=format&fit=crop&q=80',
      description: 'Trang bị nguồn âm thanh SuperNATURAL Piano và bàn phím PHA-4 chuẩn cơ mang lại cảm giác phím nặng chân thực, kết nối Bluetooth thông minh.',
      cost_price: 15500000, margin: null, status: 'active', stock: 8
    },
    {
      id: 6, category_id: 2, code: 'PNO-YAM-P45', name: 'Đàn Piano Điện Yamaha P-45B',
      image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&auto=format&fit=crop&q=80',
      description: 'Thiết kế gọn gàng thanh lịch, công nghệ GHS tái hiện độ nặng phím chân thực, âm thanh đại dương cầm AWM sống động.',
      cost_price: 9800000, margin: null, status: 'active', stock: 12
    },
    {
      id: 7, category_id: 2, code: 'PNO-CAS-CTX700', name: 'Đàn Organ Keyboard Casio CT-X700',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      description: 'Nguồn âm thanh AiX tái tạo trung thực âm sắc nhạc cụ mộc, 600 âm sắc phong phú và 195 điệu đệm, có cổng USB kết nối máy tính tiện lợi.',
      cost_price: 4100000, margin: 25.0, status: 'active', stock: 14
    },
    {
      id: 8, category_id: 3, code: 'DRM-PEA-ROAD', name: 'Bộ Trống Cơ Pearl Roadshow RS525SC',
      image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80',
      description: 'Bộ trống 5 món tiêu chuẩn quốc tế từ hãng Pearl lừng danh, vỏ gỗ bạch dương 9 lớp dầy dặn, âm thanh uy lực, đi kèm cymbals và ghế ngồi.',
      cost_price: 13200000, margin: null, status: 'active', stock: 5
    },
    {
      id: 9, category_id: 3, code: 'DRM-ROL-TD1DMK', name: 'Bộ Trống Điện Tử Roland TD-1DMK',
      image: 'https://images.unsplash.com/photo-1543443436-1216a30141f2?w=600&auto=format&fit=crop&q=80',
      description: 'Toàn bộ mặt pad bằng lưới kép (mesh head) cao cấp cho cảm giác gõ như trống thật và độ ồn cực thấp khi tập luyện tại gia đình với tai nghe.',
      cost_price: 16500000, margin: 25.0, status: 'active', stock: 7
    },
    {
      id: 10, category_id: 3, code: 'DRM-MEI-HCS', name: 'Bộ Lá Cymbals Meinl HCS Bronze Complete',
      image: 'https://images.unsplash.com/photo-1571327073757-71d13c1459ee?w=600&auto=format&fit=crop&q=80',
      description: 'Sản xuất tại Đức từ hợp kim đồng B8 cao cấp, độ bền vượt trội, âm thanh sắc nét sáng rõ trong từng nhịp gõ.',
      cost_price: 5600000, margin: null, status: 'active', stock: 9
    },
    {
      id: 11, category_id: 4, code: 'VLN-YAM-V5SC', name: 'Đàn Violin Yamaha V5SC 4/4 Full Size',
      image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&auto=format&fit=crop&q=80',
      description: 'Chế tác thủ công hoàn toàn từ gỗ vân sam và phong sấy tự nhiên, hoàn thiện bằng lớp véc-ni bóng bẩy, đi kèm vĩ kéo và hộp đựng cao cấp.',
      cost_price: 8500000, margin: null, status: 'active', stock: 8
    },
    {
      id: 12, category_id: 4, code: 'VLN-EAS-VC100', name: 'Đàn Cello Eastman Samuel VC100',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      description: 'Cây Cello tuyệt tác dành cho học sinh trung cấp và nhạc công bán chuyên, tiếng bass trầm ấm đầy uy quyền và biểu cảm.',
      cost_price: 22000000, margin: 20.0, status: 'active', stock: 3
    },
    {
      id: 13, category_id: 5, code: 'WND-YAM-YFL222', name: 'Kèn Sáo Flute Yamaha YFL-222 Học Tập',
      image: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=600&auto=format&fit=crop&q=80',
      description: 'Thân kèn mạ bạc nickel sáng bóng bền bỉ, lỗ bấm khép kín (closed-hole), phản hồi âm thanh nhanh và dễ thổi ngay cả cho người mới bắt đầu.',
      cost_price: 11200000, margin: null, status: 'active', stock: 7
    },
    {
      id: 14, category_id: 5, code: 'WND-YAM-YAS280', name: 'Kèn Saxophone Alto Yamaha YAS-280',
      image: 'https://images.unsplash.com/photo-1525994886773-080587e161c2?w=600&auto=format&fit=crop&q=80',
      description: 'Kèn Alto Saxophone tiêu chuẩn vàng thế giới, cơ chế phím bấm mượt mà chính xác, tạo âm sắc ấm áp và chuẩn ngữ điệu.',
      cost_price: 24500000, margin: 20.0, status: 'active', stock: 4
    },
    {
      id: 15, category_id: 5, code: 'WND-HOH-SILVER', name: 'Kèn Harmonica Hohner Silver Star Key C',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      description: 'Harmonica 10 lỗ giọng Đô (Key C) từ thương hiệu lừng danh Hohner Đức, nắp ốp inox không rỉ, âm thanh trong trẻo linh hoạt.',
      cost_price: 320000, margin: 40.0, status: 'active', stock: 25
    },
    {
      id: 16, category_id: 6, code: 'ACC-KOR-TM60', name: 'Máy Đập Nhịp & Lên Dây Korg TM-60 Combo',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      description: 'Màn hình LCD lớn hiển thị rõ ràng, tích hợp cùng lúc Tuner đo cao độ chuẩn xác và Metronome đập nhịp tiện lợi.',
      cost_price: 680000, margin: null, status: 'active', stock: 30
    },
    {
      id: 17, category_id: 6, code: 'ACC-DAD-EJ16', name: "Bộ Dây Đàn Guitar D'Addario EJ16",
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
      description: "Dây Phosphor Bronze chính hãng sản xuất tại Mỹ, âm sắc ấm vang cân bằng hoàn hảo, độ bền dây vượt trội.",
      cost_price: 185000, margin: 50.0, status: 'active', stock: 45
    },
    {
      id: 18, category_id: 6, code: 'ACC-HER-STAND', name: 'Chân Đàn Guitar Tự Khóa Hercules GS414B',
      image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80',
      description: 'Cơ chế Auto Grip System (AGS) tự động kẹp giữ cần đàn chắc chắn và an toàn tuyệt đối chống rơi đổ.',
      cost_price: 790000, margin: null, status: 'active', stock: 18
    }
  ];

  const DEFAULT_USERS = [
    {
      id: 1, username: 'admin', password: 'admin123', full_name: 'Quản Trị Viên',
      email: 'admin@musicstore.vn', phone: '0909000999', address: 'Số 1 Phố Nhạc Cụ, Hà Nội',
      role: 'admin', status: 'active'
    },
    {
      id: 2, username: 'khachhang1', password: '123456', full_name: 'Nguyễn Văn An',
      email: 'nguyenvanan@gmail.com', phone: '0912345678', address: '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
      role: 'customer', status: 'active'
    },
    {
      id: 3, username: 'khachhang2', password: '123456', full_name: 'Trần Thị Mai',
      email: 'tranmai@gmail.com', phone: '0987654321', address: '45 Hai Bà Trưng, Phường Tràng Tiền, Hoàn Kiếm, Hà Nội',
      role: 'customer', status: 'active'
    },
    {
      id: 4, username: 'khachhang_bi_khoa', password: '123456', full_name: 'Lê Khóa Tài Khoản',
      email: 'lekhoa@gmail.com', phone: '0933445566', address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      role: 'customer', status: 'locked'
    }
  ];

  const DEFAULT_IMPORTS = [
    {
      id: 1, receipt_code: 'PN-2026-001', import_date: '2026-10-18', status: 'completed',
      total_cost: 78500000, notes: 'Nhập lô hàng Guitar Yamaha và Roland Piano phục vụ mùa tựu trường',
      items: [
        { product_id: 1, product_name: 'Đàn Guitar Acoustic Yamaha F310', import_price: 2500000, quantity: 10, subtotal: 25000000 },
        { product_id: 5, product_name: 'Đàn Piano Điện Roland FP-30X', import_price: 15500000, quantity: 3, subtotal: 46500000 },
        { product_id: 17, product_name: "Bộ Dây Đàn Guitar D'Addario EJ16", import_price: 140000, quantity: 50, subtotal: 7000000 }
      ]
    },
    {
      id: 2, receipt_code: 'PN-2026-002', import_date: '2026-10-28', status: 'completed',
      total_cost: 52100000, notes: 'Nhập bổ sung bộ trống Pearl và kèn Alto Saxophone',
      items: [
        { product_id: 8, product_name: 'Bộ Trống Cơ Pearl Roadshow RS525SC', import_price: 13200000, quantity: 2, subtotal: 26400000 },
        { product_id: 14, product_name: 'Kèn Saxophone Alto Yamaha YAS-280', import_price: 24500000, quantity: 1, subtotal: 24500000 },
        { product_id: 18, product_name: 'Chân Đàn Guitar Tự Khóa Hercules GS414B', import_price: 600000, quantity: 2, subtotal: 1200000 }
      ]
    },
    {
      id: 3, receipt_code: 'PN-2026-003', import_date: '2026-11-02', status: 'draft',
      total_cost: 29200000, notes: 'Phiếu nháp: Nhập Violin và Đàn Classic dự kiến giao cuối tuần',
      items: [
        { product_id: 3, product_name: 'Đàn Guitar Classic Cordoba C1M', import_price: 3200000, quantity: 4, subtotal: 12800000 },
        { product_id: 11, product_name: 'Đàn Violin Yamaha V5SC 4/4 Full Size', import_price: 8200000, quantity: 2, subtotal: 16400000 }
      ]
    }
  ];

  const DEFAULT_ORDERS = [
    {
      id: 1, order_code: 'DH-2026-001', user_id: 2, recipient_name: 'Nguyễn Văn An',
      recipient_phone: '0912345678', recipient_address: '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
      payment_method: 'cod', payment_status: 'paid', order_status: 'delivered',
      total_amount: 3959000, notes: 'Giao giờ hành chính', created_at: '2026-10-25 14:30:00',
      items: [
        { product_id: 1, product_name: 'Đàn Guitar Acoustic Yamaha F310', unit_price: 3125000, quantity: 1, subtotal: 3125000 },
        { product_id: 17, product_name: "Bộ Dây Đàn Guitar D'Addario EJ16", unit_price: 278000, quantity: 3, subtotal: 834000 }
      ]
    },
    {
      id: 2, order_code: 'DH-2026-002', user_id: 3, recipient_name: 'Trần Thị Mai',
      recipient_phone: '0987654321', recipient_address: '45 Hai Bà Trưng, Phường Tràng Tiền, Hoàn Kiếm, Hà Nội',
      payment_method: 'bank_transfer', payment_status: 'paid', order_status: 'processing',
      total_amount: 18600000, notes: 'Đóng gói cẩn thận giúp tôi', created_at: '2026-10-31 09:15:00',
      items: [
        { product_id: 5, product_name: 'Đàn Piano Điện Roland FP-30X', unit_price: 18600000, quantity: 1, subtotal: 18600000 }
      ]
    },
    {
      id: 3, order_code: 'DH-2026-003', user_id: 2, recipient_name: 'Nguyễn Văn An',
      recipient_phone: '0912345678', recipient_address: 'Chung cư Sunrise City, Quận 7, TP.HCM',
      payment_method: 'cod', payment_status: 'unpaid', order_status: 'pending',
      total_amount: 1067000, notes: 'Giao cuối tuần', created_at: '2026-11-03 08:20:00',
      items: [
        { product_id: 18, product_name: 'Chân Đàn Guitar Tự Khóa Hercules GS414B', unit_price: 1067000, quantity: 1, subtotal: 1067000 }
      ]
    },
    {
      id: 4, order_code: 'DH-2026-004', user_id: 3, recipient_name: 'Trần Thị Mai',
      recipient_phone: '0987654321', recipient_address: '45 Hai Bà Trưng, Hoàn Kiếm, Hà Nội',
      payment_method: 'online', payment_status: 'unpaid', order_status: 'cancelled',
      total_amount: 5125000, notes: 'Khách đổi ý muốn mua đàn điện', created_at: '2026-10-22 16:45:00',
      items: [
        { product_id: 7, product_name: 'Đàn Organ Keyboard Casio CT-X700', unit_price: 5125000, quantity: 1, subtotal: 5125000 }
      ]
    }
  ];

  // Helper localStorage
  function _get(key, defaultVal) {
    try {
      const val = localStorage.getItem(STORAGE_PREFIX + key);
      return val !== null ? JSON.parse(val) : defaultVal;
    } catch (e) {
      console.warn('Storage read error:', e);
      return defaultVal;
    }
  }

  function _set(key, val) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  // Khởi tạo Database nếu chưa có
  function initStorage(forceReset = false) {
    if (forceReset || !_get('initialized', false)) {
      _set('categories', DEFAULT_CATEGORIES);
      _set('products', DEFAULT_PRODUCTS);
      _set('users', DEFAULT_USERS);
      _set('imports', DEFAULT_IMPORTS);
      _set('orders', DEFAULT_ORDERS);
      _set('cart', []);
      _set('currentUser', null); // Mặc định khách chưa đăng nhập
      _set('adminUser', null); // Chưa đăng nhập admin
      _set('initialized', true);
      console.log('Melody Store DB initialized with seed data.');
    }
  }

  // SVG Fallback cho ảnh nhạc cụ khi máy chấm không có mạng
  const SVG_INSTRUMENT_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f1f5f9"/>
      <circle cx="200" cy="150" r="50" fill="#e2e8f0"/>
      <path d="M190 120 L190 160 A15 15 0 0 0 205 175 A15 15 0 0 0 220 160 L220 100 L240 100 L240 85 L200 85 L190 120 Z" fill="#b45309"/>
      <text x="200" y="235" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#64748b" text-anchor="middle">Melody Store Instrument</text>
    </svg>
  `)}`;

  // Public API
  const DB = {
    init: initStorage,
    resetToDefaults: () => initStorage(true),
    getFallbackImage: () => SVG_INSTRUMENT_FALLBACK,

    // Helper format
    formatVND(amount) {
      if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
      return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (e) {
        return dateStr;
      }
    },

    formatDateOnly(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    },

    // Tính giá bán theo công thức chuẩn: Giá bán = Giá vốn * (1 + % Lợi nhuận / 100)
    calcProductPrice(product) {
      if (!product) return 0;
      const categories = DB.getCategories();
      const cat = categories.find(c => c.id === Number(product.category_id)) || { profit_margin: 20 };
      const margin = (product.margin !== null && product.margin !== undefined && !isNaN(product.margin))
        ? Number(product.margin)
        : Number(cat.profit_margin || 20);
      const cost = Number(product.cost_price || 0);
      return Math.round(cost * (1 + margin / 100));
    },

    getProductMargin(product) {
      if (!product) return 20;
      if (product.margin !== null && product.margin !== undefined && !isNaN(product.margin)) {
        return Number(product.margin);
      }
      const categories = DB.getCategories();
      const cat = categories.find(c => c.id === Number(product.category_id));
      return cat ? Number(cat.profit_margin || 20) : 20;
    },

    // Categories
    getCategories() {
      return _get('categories', DEFAULT_CATEGORIES);
    },
    saveCategories(categories) {
      _set('categories', categories);
    },
    addCategory(cat) {
      const categories = DB.getCategories();
      const nextId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      const newCat = {
        id: nextId,
        code: cat.code.toUpperCase().trim(),
        name: cat.name.trim(),
        description: cat.description || '',
        status: cat.status || 'active',
        profit_margin: Number(cat.profit_margin) || 20
      };
      categories.push(newCat);
      DB.saveCategories(categories);
      return newCat;
    },
    updateCategory(id, updated) {
      const categories = DB.getCategories();
      const idx = categories.findIndex(c => c.id === Number(id));
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...updated };
        DB.saveCategories(categories);
        return categories[idx];
      }
      return null;
    },
    deleteCategory(id) {
      // Chỉ cho xóa nếu chưa có sản phẩm thuộc loại này
      const products = DB.getProducts();
      const hasProducts = products.some(p => p.category_id === Number(id));
      if (hasProducts) {
        return { success: false, message: 'Không thể xóa loại đã có sản phẩm! Hãy dùng chức năng Ẩn thay thế.' };
      }
      let categories = DB.getCategories();
      categories = categories.filter(c => c.id !== Number(id));
      DB.saveCategories(categories);
      return { success: true };
    },

    // Products
    getProducts(includeHidden = true) {
      const products = _get('products', DEFAULT_PRODUCTS);
      return includeHidden ? products : products.filter(p => p.status === 'active');
    },
    getProductById(id) {
      const products = DB.getProducts();
      return products.find(p => p.id === Number(id));
    },
    saveProducts(products) {
      _set('products', products);
    },
    addProduct(p) {
      const products = DB.getProducts();
      const nextId = products.length ? Math.max(...products.map(i => i.id)) + 1 : 1;
      const newProduct = {
        id: nextId,
        category_id: Number(p.category_id),
        code: p.code.toUpperCase().trim(),
        name: p.name.trim(),
        image: p.image && p.image.trim() ? p.image.trim() : SVG_INSTRUMENT_FALLBACK,
        description: p.description || '',
        cost_price: Number(p.cost_price) || 0,
        margin: (p.margin !== '' && p.margin !== null && p.margin !== undefined) ? Number(p.margin) : null,
        status: p.status || 'active',
        stock: Number(p.stock) || 0
      };
      products.push(newProduct);
      DB.saveProducts(products);
      return newProduct;
    },
    updateProduct(id, updated) {
      const products = DB.getProducts();
      const idx = products.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updated };
        DB.saveProducts(products);
        return products[idx];
      }
      return null;
    },
    deleteProduct(id) {
      let products = DB.getProducts();
      products = products.filter(p => p.id !== Number(id));
      DB.saveProducts(products);
      return true;
    },

    // Users
    getUsers() {
      return _get('users', DEFAULT_USERS);
    },
    getUserById(id) {
      return DB.getUsers().find(u => u.id === Number(id));
    },
    saveUsers(users) {
      _set('users', users);
    },
    addUser(userData) {
      const users = DB.getUsers();
      if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
      }
      const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        username: userData.username.trim(),
        password: userData.password,
        full_name: userData.full_name.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim(),
        address: userData.address.trim(),
        role: 'customer',
        status: 'active'
      };
      users.push(newUser);
      DB.saveUsers(users);
      return { success: true, user: newUser };
    },
    updateUser(id, updated) {
      const users = DB.getUsers();
      const idx = users.findIndex(u => u.id === Number(id));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        DB.saveUsers(users);
        // Cập nhật session currentUser nếu đang đăng nhập đúng user đó
        const current = DB.getCurrentUser();
        if (current && current.id === Number(id)) {
          DB.setCurrentUser(users[idx]);
        }
        return users[idx];
      }
      return null;
    },

    // Current Customer Session
    getCurrentUser() {
      return _get('currentUser', null);
    },
    setCurrentUser(user) {
      _set('currentUser', user);
    },
    logoutCustomer() {
      _set('currentUser', null);
      _set('cart', []);
    },

    // Admin Session
    getAdminUser() {
      return _get('adminUser', null);
    },
    setAdminUser(user) {
      _set('adminUser', user);
    },
    logoutAdmin() {
      _set('adminUser', null);
    },

    // Cart
    getCart() {
      return _get('cart', []);
    },
    saveCart(cart) {
      _set('cart', cart);
    },
    addToCart(productId, qty = 1) {
      const cart = DB.getCart();
      const product = DB.getProductById(productId);
      if (!product) return { success: false, message: 'Không tìm thấy sản phẩm!' };

      const existing = cart.find(item => item.product_id === Number(productId));
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + Number(qty);

      if (targetQty > product.stock) {
        return { success: false, message: `Số lượng vượt quá tồn kho hiện có (${product.stock} sản phẩm)!` };
      }

      if (existing) {
        existing.quantity = targetQty;
      } else {
        cart.push({
          product_id: Number(productId),
          quantity: Number(qty)
        });
      }
      DB.saveCart(cart);
      return { success: true, cartCount: DB.getCartCount() };
    },
    updateCartItem(productId, quantity) {
      let cart = DB.getCart();
      const product = DB.getProductById(productId);
      if (quantity <= 0) {
        cart = cart.filter(item => item.product_id !== Number(productId));
      } else {
        const item = cart.find(i => i.product_id === Number(productId));
        if (item) {
          if (product && quantity > product.stock) {
            item.quantity = product.stock;
            DB.saveCart(cart);
            return { success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho!` };
          }
          item.quantity = quantity;
        }
      }
      DB.saveCart(cart);
      return { success: true };
    },
    removeFromCart(productId) {
      let cart = DB.getCart();
      cart = cart.filter(item => item.product_id !== Number(productId));
      DB.saveCart(cart);
    },
    clearCart() {
      _set('cart', []);
    },
    getCartCount() {
      const cart = DB.getCart();
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    getCartDetails() {
      const cart = DB.getCart();
      const products = DB.getProducts();
      return cart.map(item => {
        const product = products.find(p => p.id === item.product_id);
        const unitPrice = product ? DB.calcProductPrice(product) : 0;
        return {
          product_id: item.product_id,
          product: product,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal: unitPrice * item.quantity
        };
      }).filter(item => item.product !== undefined);
    },

    // Orders
    getOrders() {
      return _get('orders', DEFAULT_ORDERS);
    },
    saveOrders(orders) {
      _set('orders', orders);
    },
    createOrder(orderData) {
      const orders = DB.getOrders();
      const nextId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
      const orderCode = 'DH-' + new Date().getFullYear() + '-' + String(nextId).padStart(3, '0');

      const now = new Date();
      const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

      const newOrder = {
        id: nextId,
        order_code: orderCode,
        user_id: orderData.user_id,
        recipient_name: orderData.recipient_name.trim(),
        recipient_phone: orderData.recipient_phone.trim(),
        recipient_address: orderData.recipient_address.trim(),
        payment_method: orderData.payment_method || 'cod',
        payment_status: orderData.payment_method === 'cod' ? 'unpaid' : 'paid',
        order_status: 'pending',
        total_amount: Number(orderData.total_amount),
        notes: orderData.notes ? orderData.notes.trim() : '',
        created_at: nowStr,
        items: orderData.items || []
      };

      // Trừ số lượng tồn kho của các sản phẩm trong đơn
      const products = DB.getProducts();
      newOrder.items.forEach(item => {
        const p = products.find(prod => prod.id === item.product_id);
        if (p) {
          p.stock = Math.max(0, p.stock - item.quantity);
        }
      });
      DB.saveProducts(products);

      orders.unshift(newOrder);
      DB.saveOrders(orders);
      DB.clearCart();
      return newOrder;
    },
    updateOrderStatus(orderId, newStatus) {
      const orders = DB.getOrders();
      const order = orders.find(o => o.id === Number(orderId));
      if (!order) return false;

      // Nếu chuyển sang hủy và trước đó chưa hủy -> hoàn tồn kho
      if (newStatus === 'cancelled' && order.order_status !== 'cancelled') {
        const products = DB.getProducts();
        order.items.forEach(item => {
          const p = products.find(prod => prod.id === item.product_id);
          if (p) {
            p.stock += item.quantity;
          }
        });
        DB.saveProducts(products);
      }

      order.order_status = newStatus;
      if (newStatus === 'delivered') {
        order.payment_status = 'paid';
      }
      DB.saveOrders(orders);
      return true;
    },

    // Imports (Phiếu nhập hàng)
    getImports() {
      return _get('imports', DEFAULT_IMPORTS);
    },
    saveImports(imports) {
      _set('imports', imports);
    },
    addImportReceipt(receiptData) {
      const imports = DB.getImports();
      const nextId = imports.length ? Math.max(...imports.map(i => i.id)) + 1 : 1;
      const code = 'PN-' + new Date().getFullYear() + '-' + String(nextId).padStart(3, '0');

      const newReceipt = {
        id: nextId,
        receipt_code: code,
        import_date: receiptData.import_date || new Date().toISOString().substring(0, 10),
        status: 'draft',
        total_cost: Number(receiptData.total_cost || 0),
        notes: receiptData.notes || '',
        items: receiptData.items || []
      };

      imports.unshift(newReceipt);
      DB.saveImports(imports);
      return newReceipt;
    },
    updateImportReceipt(id, updated) {
      const imports = DB.getImports();
      const idx = imports.findIndex(i => i.id === Number(id));
      if (idx !== -1) {
        if (imports[idx].status === 'completed') {
          return { success: false, message: 'Phiếu đã hoàn thành, không thể chỉnh sửa!' };
        }
        imports[idx] = { ...imports[idx], ...updated };
        DB.saveImports(imports);
        return { success: true, receipt: imports[idx] };
      }
      return { success: false, message: 'Không tìm thấy phiếu nhập!' };
    },
    completeImportReceipt(id) {
      const imports = DB.getImports();
      const receipt = imports.find(i => i.id === Number(id));
      if (!receipt) return { success: false, message: 'Không tìm thấy phiếu nhập!' };
      if (receipt.status === 'completed') return { success: false, message: 'Phiếu này đã hoàn thành trước đó!' };

      // Cập nhật tồn kho và giá vốn sản phẩm
      const products = DB.getProducts();
      receipt.items.forEach(item => {
        const prod = products.find(p => p.id === Number(item.product_id));
        if (prod) {
          prod.stock += Number(item.quantity);
          prod.cost_price = Number(item.import_price); // Cập nhật giá vốn mới nhất
        }
      });
      DB.saveProducts(products);

      receipt.status = 'completed';
      DB.saveImports(imports);
      return { success: true };
    },

    // Báo cáo Nhập - Xuất - Tồn trong khoảng thời gian
    getInventoryReport(fromDateStr, toDateStr, productId = null) {
      const products = DB.getProducts();
      const imports = DB.getImports().filter(i => i.status === 'completed');
      const orders = DB.getOrders().filter(o => o.order_status !== 'cancelled');

      const fromDate = fromDateStr ? new Date(fromDateStr) : new Date('2020-01-01');
      const toDate = toDateStr ? new Date(toDateStr + 'T23:59:59') : new Date('2099-12-31');

      let targetProducts = products;
      if (productId) {
        targetProducts = products.filter(p => p.id === Number(productId));
      }

      return targetProducts.map(p => {
        // Tổng nhập trong kỳ
        let nhapTrongKy = 0;
        let nhapSauKy = 0;
        imports.forEach(imp => {
          const d = new Date(imp.import_date);
          const item = imp.items.find(i => Number(i.product_id) === p.id);
          if (item) {
            if (d >= fromDate && d <= toDate) {
              nhapTrongKy += Number(item.quantity);
            } else if (d > toDate) {
              nhapSauKy += Number(item.quantity);
            }
          }
        });

        // Tổng xuất trong kỳ (qua đơn hàng không bị hủy)
        let xuatTrongKy = 0;
        let xuatSauKy = 0;
        orders.forEach(ord => {
          const d = new Date(ord.created_at);
          const item = ord.items.find(i => Number(i.product_id) === p.id);
          if (item) {
            if (d >= fromDate && d <= toDate) {
              xuatTrongKy += Number(item.quantity);
            } else if (d > toDate) {
              xuatSauKy += Number(item.quantity);
            }
          }
        });

        // Tồn thực tế hiện tại
        const tonHienTai = p.stock;
        // Tồn cuối kỳ = Tồn hiện tại - Nhập sau kỳ + Xuất sau kỳ
        const tonCuoiKy = Math.max(0, tonHienTai - nhapSauKy + xuatSauKy);
        // Tồn đầu kỳ = Tồn cuối kỳ - Nhập trong kỳ + Xuất trong kỳ
        const tonDauKy = Math.max(0, tonCuoiKy - nhapTrongKy + xuatTrongKy);

        return {
          product_id: p.id,
          code: p.code,
          name: p.name,
          cost_price: p.cost_price,
          stock_current: tonHienTai,
          ton_dau: tonDauKy,
          nhap: nhapTrongKy,
          xuat: xuatTrongKy,
          ton_cuoi: tonCuoiKy
        };
      });
    }
  };

  // Tự động khởi tạo ngay khi nạp file
  DB.init();

  // Đính kèm vào window
  window.MusicStoreDB = DB;

})(typeof window !== 'undefined' ? window : this);
