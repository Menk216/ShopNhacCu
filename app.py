import os
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, g, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import database

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Ensure database is initialized on startup
database.init_db()

# ----------------- Decorators & Helpers -----------------

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.user:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để thực hiện chức năng này', 'require_login': True}), 401
            return redirect(url_for('customer_login_page', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.admin:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Yêu cầu quyền Quản trị viên', 'require_admin': True}), 403
            return redirect(url_for('admin_login_page'))
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def load_current_user():
    user_id = session.get('user_id')
    if user_id:
        conn = database.get_db_connection()
        user = conn.execute("SELECT id, username, full_name, email, phone, address, role, status FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        if user and user['status'] == 'active':
            g.user = dict(user)
        else:
            session.pop('user_id', None)
            g.user = None
    else:
        g.user = None

    admin_id = session.get('admin_id')
    if admin_id:
        conn = database.get_db_connection()
        admin_user = conn.execute("SELECT id, username, full_name, email, role, status FROM users WHERE id = ? AND role = 'admin'", (admin_id,)).fetchone()
        conn.close()
        if admin_user and admin_user['status'] == 'active':
            g.admin = dict(admin_user)
        else:
            session.pop('admin_id', None)
            g.admin = None
    else:
        g.admin = None

@app.context_processor
def inject_global_vars():
    # Provide active categories and cart count for layouts
    conn = database.get_db_connection()
    categories = conn.execute("SELECT id, code, name FROM categories WHERE status = 'active' ORDER BY name ASC").fetchall()
    cart_count = 0
    if g.user:
        count_row = conn.execute("SELECT SUM(quantity) as total_qty FROM cart_items WHERE user_id = ?", (g.user['id'],)).fetchone()
        if count_row and count_row['total_qty']:
            cart_count = count_row['total_qty']
    conn.close()
    return {
        'current_user': g.user,
        'current_admin': g.admin,
        'nav_categories': [dict(c) for c in categories],
        'cart_count': cart_count,
        'now_year': datetime.now().year
    }

# ----------------- Customer Page Routes -----------------

@app.route('/')
def home():
    if os.path.exists(os.path.join(app.root_path, 'index.html')):
        return send_from_directory(app.root_path, 'index.html')
    return render_template('index.html')

@app.route('/index.html')
def serve_index_html():
    return send_from_directory(app.root_path, 'index.html')

@app.route('/customer.html')
def serve_customer_html():
    return send_from_directory(app.root_path, 'customer.html')

@app.route('/admin.html')
def serve_admin_html():
    return send_from_directory(app.root_path, 'admin.html')

@app.route('/admin-ops.html')
def serve_admin_ops_html():
    return send_from_directory(app.root_path, 'admin-ops.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    return render_template('product_detail.html', product_id=product_id)

@app.route('/cart')
@login_required
def cart_page():
    return render_template('cart.html')

@app.route('/checkout')
@login_required
def checkout_page():
    return render_template('checkout.html')

@app.route('/order-success/<order_code>')
@login_required
def order_success_page(order_code):
    return render_template('order_success.html', order_code=order_code)

@app.route('/orders')
@login_required
def customer_orders_page():
    return render_template('orders.html')

@app.route('/profile')
@login_required
def profile_page():
    return render_template('profile.html')

@app.route('/login')
def customer_login_page():
    if g.user:
        return redirect(url_for('home'))
    return render_template('login.html')

@app.route('/register')
def customer_register_page():
    if g.user:
        return redirect(url_for('home'))
    return render_template('login.html', register=True)

# ----------------- Admin Page Routes -----------------

@app.route('/admin')
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard_page():
    return render_template('admin/dashboard.html')

@app.route('/admin/login')
def admin_login_page():
    if g.admin:
        return redirect(url_for('admin_dashboard_page'))
    return render_template('admin/login.html')

@app.route('/admin/users')
@admin_required
def admin_users_page():
    return render_template('admin/users.html')

@app.route('/admin/categories')
@admin_required
def admin_categories_page():
    return render_template('admin/categories.html')

@app.route('/admin/products')
@admin_required
def admin_products_page():
    return render_template('admin/products.html')

@app.route('/admin/imports')
@admin_required
def admin_imports_page():
    return render_template('admin/imports.html')

@app.route('/admin/pricing')
@admin_required
def admin_pricing_page():
    return render_template('admin/pricing.html')

@app.route('/admin/orders')
@admin_required
def admin_orders_page():
    return render_template('admin/orders.html')

@app.route('/admin/inventory')
@admin_required
def admin_inventory_page():
    return render_template('admin/inventory.html')


# ========================================================
#                     CUSTOMER APIs
# ========================================================

# --- Customer Authentication ---

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()

    if not username or not password or not full_name:
        return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và họ tên'}), 400

    conn = database.get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'Tên đăng nhập đã tồn tại trên hệ thống'}), 400

    password_hash = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (username, password_hash, full_name, email, phone, address, role, status)
        VALUES (?, ?, ?, ?, ?, ?, 'customer', 'active')
    ''', (username, password_hash, full_name, email, phone, address))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Automatically log in
    session['user_id'] = user_id

    return jsonify({'success': True, 'message': 'Đăng ký tài khoản thành công', 'user_id': user_id})

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Vui lòng nhập tên đăng nhập và mật khẩu'}), 400

    conn = database.get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Tên đăng nhập hoặc mật khẩu không chính xác'}), 401

    if user['status'] == 'locked':
        return jsonify({'success': False, 'message': 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ!'}), 403

    session['user_id'] = user['id']

    return jsonify({
        'success': True,
        'message': 'Đăng nhập thành công',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'full_name': user['full_name'],
            'role': user['role']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Đã đăng xuất tài khoản'})

@app.route('/api/auth/me', methods=['GET'])
def api_get_me():
    if not g.user:
        return jsonify({'success': False, 'logged_in': False}), 401
    return jsonify({'success': True, 'logged_in': True, 'user': g.user})

@app.route('/api/auth/profile', methods=['GET', 'PUT'])
@login_required
def api_profile():
    conn = database.get_db_connection()
    if request.method == 'GET':
        user = conn.execute("SELECT id, username, full_name, email, phone, address, role, status, created_at FROM users WHERE id = ?", (g.user['id'],)).fetchone()
        conn.close()
        return jsonify({'success': True, 'user': dict(user)})

    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    old_password = data.get('old_password', '').strip()
    new_password = data.get('new_password', '').strip()

    if not full_name:
        conn.close()
        return jsonify({'success': False, 'message': 'Họ và tên không được để trống'}), 400

    if new_password:
        curr = conn.execute("SELECT password_hash FROM users WHERE id = ?", (g.user['id'],)).fetchone()
        if not old_password or not check_password_hash(curr['password_hash'], old_password):
            conn.close()
            return jsonify({'success': False, 'message': 'Mật khẩu cũ không chính xác'}), 400
        new_hash = generate_password_hash(new_password)
        conn.execute('''
            UPDATE users SET full_name = ?, email = ?, phone = ?, address = ?, password_hash = ? WHERE id = ?
        ''', (full_name, email, phone, address, new_hash, g.user['id']))
    else:
        conn.execute('''
            UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?
        ''', (full_name, email, phone, address, g.user['id']))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Cập nhật thông tin cá nhân thành công'})

# --- Products Catalog & Search ---

@app.route('/api/categories', methods=['GET'])
def api_get_categories():
    conn = database.get_db_connection()
    rows = conn.execute("SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC").fetchall()
    conn.close()
    return jsonify({'success': True, 'categories': [dict(r) for r in rows]})

@app.route('/api/products', methods=['GET'])
def api_get_products():
    """
    Handles:
    - Listing active products
    - Filter by category
    - Basic search (by name)
    - Advanced search (name, category, min_price, max_price combined)
    - Pagination (page, limit)
    """
    category_id = request.args.get('category_id', type=int)
    search_query = request.args.get('q', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort_by = request.args.get('sort', 'newest') # 'newest', 'price_asc', 'price_desc'
    page = max(1, request.args.get('page', 1, type=int))
    limit = max(1, min(50, request.args.get('limit', 8, type=int)))

    conn = database.get_db_connection()

    sql_query = '''
        SELECT p.*, c.name as category_name, c.profit_margin_percent as category_profit_margin
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND c.status = 'active'
    '''
    params = []

    if category_id:
        sql_query += " AND p.category_id = ?"
        params.append(category_id)

    if search_query:
        sql_query += " AND (p.name LIKE ? OR p.code LIKE ? OR p.description LIKE ?)"
        wildcard = f"%{search_query}%"
        params.extend([wildcard, wildcard, wildcard])

    rows = conn.execute(sql_query, params).fetchall()
    conn.close()

    # Calculate prices and apply price range filtering
    processed = []
    for r in rows:
        item = database.calculate_product_prices(r)
        sp = item['selling_price']
        if min_price is not None and sp < min_price:
            continue
        if max_price is not None and sp > max_price:
            continue
        processed.append(item)

    # Sort
    if sort_by == 'price_asc':
        processed.sort(key=lambda x: x['selling_price'])
    elif sort_by == 'price_desc':
        processed.sort(key=lambda x: x['selling_price'], reverse=True)
    elif sort_by == 'name_asc':
        processed.sort(key=lambda x: x['name'])
    else: # newest
        processed.sort(key=lambda x: x['id'], reverse=True)

    # Pagination
    total_count = len(processed)
    total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
    start_idx = (page - 1) * limit
    paginated_items = processed[start_idx:start_idx + limit]

    return jsonify({
        'success': True,
        'products': paginated_items,
        'pagination': {
            'total_items': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'limit': limit
        }
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def api_get_product_detail(product_id):
    conn = database.get_db_connection()
    row = conn.execute('''
        SELECT p.*, c.name as category_name, c.profit_margin_percent as category_profit_margin
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.status = 'active'
    ''', (product_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({'success': False, 'message': 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn'}), 404

    item = database.calculate_product_prices(row)
    return jsonify({'success': True, 'product': item})

# --- Shopping Cart ---

@app.route('/api/cart', methods=['GET'])
@login_required
def api_get_cart():
    conn = database.get_db_connection()
    rows = conn.execute('''
        SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.code, p.name, p.image_url, 
               p.stock_quantity, p.cost_price, p.profit_margin_percent, 
               c.profit_margin_percent as category_profit_margin
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE ci.user_id = ? AND p.status = 'active'
        ORDER BY ci.created_at DESC
    ''', (g.user['id'],)).fetchall()
    conn.close()

    items = []
    total_amount = 0.0
    for r in rows:
        p_calc = database.calculate_product_prices(r)
        subtotal = p_calc['selling_price'] * r['quantity']
        total_amount += subtotal
        items.append({
            'cart_item_id': r['cart_item_id'],
            'product_id': r['product_id'],
            'code': r['code'],
            'name': r['name'],
            'image_url': r['image_url'],
            'stock_quantity': r['stock_quantity'],
            'unit_price': p_calc['selling_price'],
            'quantity': r['quantity'],
            'subtotal': subtotal
        })

    return jsonify({
        'success': True,
        'cart_items': items,
        'total_amount': total_amount,
        'item_count': sum(i['quantity'] for i in items)
    })

@app.route('/api/cart/add', methods=['POST'])
@login_required
def api_cart_add():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = max(1, int(data.get('quantity', 1)))

    if not product_id:
        return jsonify({'success': False, 'message': 'Thiếu mã sản phẩm'}), 400

    conn = database.get_db_connection()
    product = conn.execute("SELECT id, name, stock_quantity, status FROM products WHERE id = ?", (product_id,)).fetchone()
    if not product or product['status'] != 'active':
        conn.close()
        return jsonify({'success': False, 'message': 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh'}), 404

    # Check current quantity in cart
    existing = conn.execute("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?", (g.user['id'], product_id)).fetchone()
    new_qty = (existing['quantity'] + quantity) if existing else quantity

    if new_qty > product['stock_quantity']:
        conn.close()
        return jsonify({'success': False, 'message': f'Số lượng yêu cầu ({new_qty}) vượt quá số lượng tồn kho ({product["stock_quantity"]})'}), 400

    if existing:
        conn.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", (new_qty, existing['id']))
    else:
        conn.execute("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)", (g.user['id'], product_id, quantity))

    conn.commit()

    total_count = conn.execute("SELECT SUM(quantity) FROM cart_items WHERE user_id = ?", (g.user['id'],)).fetchone()[0] or 0
    conn.close()

    return jsonify({'success': True, 'message': f'Đã thêm {product["name"]} vào giỏ hàng', 'total_count': total_count})

@app.route('/api/cart/update', methods=['PUT'])
@login_required
def api_cart_update():
    data = request.get_json() or {}
    cart_item_id = data.get('cart_item_id')
    quantity = int(data.get('quantity', 1))

    if not cart_item_id:
        return jsonify({'success': False, 'message': 'Thiếu mã mục giỏ hàng'}), 400

    conn = database.get_db_connection()
    item = conn.execute('''
        SELECT ci.id, ci.user_id, p.stock_quantity, p.name 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.id = ? AND ci.user_id = ?
    ''', (cart_item_id, g.user['id'])).fetchone()

    if not item:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy mục này trong giỏ hàng'}), 404

    if quantity <= 0:
        conn.execute("DELETE FROM cart_items WHERE id = ?", (cart_item_id,))
    else:
        if quantity > item['stock_quantity']:
            conn.close()
            return jsonify({'success': False, 'message': f'Số lượng ({quantity}) vượt quá tồn kho ({item["stock_quantity"]})'}), 400
        conn.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", (quantity, cart_item_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã cập nhật giỏ hàng'})

@app.route('/api/cart/remove', methods=['DELETE'])
@login_required
def api_cart_remove():
    data = request.get_json() or {}
    cart_item_id = data.get('cart_item_id')

    if not cart_item_id:
        return jsonify({'success': False, 'message': 'Thiếu mã mục giỏ hàng'}), 400

    conn = database.get_db_connection()
    conn.execute("DELETE FROM cart_items WHERE id = ? AND user_id = ?", (cart_item_id, g.user['id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa sản phẩm khỏi giỏ hàng'})

# --- Checkout & Orders ---

@app.route('/api/checkout', methods=['POST'])
@login_required
def api_checkout():
    data = request.get_json() or {}
    address_mode = data.get('address_mode', 'profile') # 'profile' or 'new'
    payment_method = data.get('payment_method', 'cod') # 'cod', 'bank_transfer', 'online'
    notes = data.get('notes', '').strip()

    if address_mode == 'profile':
        recipient_name = g.user['full_name']
        recipient_phone = g.user['phone']
        recipient_address = g.user['address']
        if not recipient_phone or not recipient_address:
            return jsonify({'success': False, 'message': 'Tài khoản chưa có đầy đủ SĐT hoặc địa chỉ nhận hàng. Vui lòng chọn nhập địa chỉ mới hoặc cập nhật thông tin cá nhân.'}), 400
    else:
        recipient_name = data.get('recipient_name', '').strip()
        recipient_phone = data.get('recipient_phone', '').strip()
        recipient_address = data.get('recipient_address', '').strip()
        if not recipient_name or not recipient_phone or not recipient_address:
            return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ Tên người nhận, SĐT và Địa chỉ giao hàng mới'}), 400

    conn = database.get_db_connection()
    cart_rows = conn.execute('''
        SELECT ci.quantity, p.id as product_id, p.name as product_name, p.stock_quantity, 
               p.cost_price, p.profit_margin_percent, c.profit_margin_percent as category_profit_margin
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE ci.user_id = ? AND p.status = 'active'
    ''', (g.user['id'],)).fetchall()

    if not cart_rows:
        conn.close()
        return jsonify({'success': False, 'message': 'Giỏ hàng của bạn đang trống'}), 400

    # Verify stock
    total_amount = 0.0
    items_to_create = []
    for r in cart_rows:
        if r['quantity'] > r['stock_quantity']:
            conn.close()
            return jsonify({'success': False, 'message': f'Sản phẩm "{r["product_name"]}" chỉ còn {r["stock_quantity"]} cái trong kho, không đủ số lượng đặt hàng.'}), 400
        p_calc = database.calculate_product_prices(r)
        price = p_calc['selling_price']
        subtotal = price * r['quantity']
        total_amount += subtotal
        items_to_create.append({
            'product_id': r['product_id'],
            'product_name': r['product_name'],
            'unit_price': price,
            'quantity': r['quantity'],
            'subtotal': subtotal
        })

    order_code = f"DH-{datetime.now().strftime('%Y%m%d%H%M%S')}-{g.user['id']}"
    payment_status = 'paid' if payment_method == 'online' else 'unpaid'

    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO orders (order_code, user_id, recipient_name, recipient_phone, recipient_address, payment_method, payment_status, order_status, total_amount, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    ''', (order_code, g.user['id'], recipient_name, recipient_phone, recipient_address, payment_method, payment_status, total_amount, notes))
    order_id = cursor.lastrowid

    for item in items_to_create:
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (order_id, item['product_id'], item['product_name'], item['unit_price'], item['quantity'], item['subtotal']))
        # Deduct stock
        cursor.execute('''
            UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
        ''', (item['quantity'], item['product_id']))

    # Clear user's cart
    cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (g.user['id'],))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Đặt hàng thành công!',
        'order_code': order_code,
        'order_id': order_id
    })

@app.route('/api/orders', methods=['GET'])
@login_required
def api_get_customer_orders():
    conn = database.get_db_connection()
    orders = conn.execute('''
        SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    ''', (g.user['id'],)).fetchall()

    result = []
    for ord_row in orders:
        ord_dict = dict(ord_row)
        items = conn.execute('''
            SELECT oi.*, p.image_url, p.code 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        ''', (ord_dict['id'],)).fetchall()
        ord_dict['items'] = [dict(i) for i in items]
        result.append(ord_dict)

    conn.close()
    return jsonify({'success': True, 'orders': result})

@app.route('/api/orders/<order_code>', methods=['GET'])
@login_required
def api_get_order_detail(order_code):
    conn = database.get_db_connection()
    order = conn.execute('''
        SELECT * FROM orders WHERE order_code = ? AND user_id = ?
    ''', (order_code, g.user['id'])).fetchone()

    if not order:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy đơn hàng'}), 404

    order_dict = dict(order)
    items = conn.execute('''
        SELECT oi.*, p.image_url, p.code 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
    ''', (order_dict['id'],)).fetchall()
    order_dict['items'] = [dict(i) for i in items]

    conn.close()
    return jsonify({'success': True, 'order': order_dict})


# ========================================================
#                      ADMIN APIs
# ========================================================

# --- Admin Authentication ---

@app.route('/api/admin/login', methods=['POST'])
def api_admin_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Vui lòng nhập tên đăng nhập và mật khẩu Quản trị'}), 400

    conn = database.get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND role = 'admin'", (username,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Tài khoản Quản trị không tồn tại hoặc mật khẩu sai!'}), 401

    if user['status'] == 'locked':
        return jsonify({'success': False, 'message': 'Tài khoản Quản trị này đang bị khóa!'}), 403

    session['admin_id'] = user['id']

    return jsonify({
        'success': True,
        'message': 'Đăng nhập Quản trị thành công',
        'admin': {
            'id': user['id'],
            'username': user['username'],
            'full_name': user['full_name']
        }
    })

@app.route('/api/admin/logout', methods=['POST'])
def api_admin_logout():
    session.pop('admin_id', None)
    return jsonify({'success': True, 'message': 'Đã đăng xuất Quản trị'})

# --- Dashboard Stats ---

@app.route('/api/admin/dashboard-stats', methods=['GET'])
@admin_required
def api_admin_dashboard_stats():
    conn = database.get_db_connection()
    total_revenue = conn.execute("SELECT SUM(total_amount) FROM orders WHERE order_status != 'cancelled'").fetchone()[0] or 0.0
    total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    pending_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE order_status = 'pending'").fetchone()[0]
    total_products = conn.execute("SELECT COUNT(*) FROM products WHERE status = 'active'").fetchone()[0]
    total_customers = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'customer'").fetchone()[0]
    low_stock_products = conn.execute("SELECT COUNT(*) FROM products WHERE stock_quantity <= 5 AND status = 'active'").fetchone()[0]

    recent_orders = conn.execute('''
        SELECT id, order_code, recipient_name, total_amount, order_status, created_at 
        FROM orders ORDER BY created_at DESC LIMIT 5
    ''').fetchall()

    conn.close()
    return jsonify({
        'success': True,
        'stats': {
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_products': total_products,
            'total_customers': total_customers,
            'low_stock_products': low_stock_products
        },
        'recent_orders': [dict(r) for r in recent_orders]
    })

# --- 2. User Management ---

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def api_admin_get_users():
    search = request.args.get('search', '').strip()
    role_filter = request.args.get('role', 'all').strip()

    conn = database.get_db_connection()
    sql = "SELECT id, username, full_name, email, phone, address, role, status, created_at FROM users WHERE 1=1"
    params = []

    if role_filter != 'all':
        sql += " AND role = ?"
        params.append(role_filter)

    if search:
        sql += " AND (username LIKE ? OR full_name LIKE ? OR phone LIKE ? OR email LIKE ?)"
        wild = f"%{search}%"
        params.extend([wild, wild, wild, wild])
    sql += " ORDER BY role ASC, id DESC"

    users = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify({'success': True, 'users': [dict(u) for u in users]})

@app.route('/api/admin/create-admin', methods=['POST'])
@admin_required
def api_admin_create_admin():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip() or 'Quản Trị Viên'
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Vui lòng nhập tên đăng nhập và mật khẩu Admin'}), 400

    conn = database.get_db_connection()
    existing = conn.execute("SELECT id, role FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        if existing['role'] == 'admin':
            conn.close()
            return jsonify({'success': False, 'message': f'Tài khoản "{username}" đã tồn tại và đang là Quản trị viên'}), 400
        else:
            # Upgrade existing customer to admin
            password_hash = generate_password_hash(password)
            conn.execute("UPDATE users SET role = 'admin', password_hash = ?, full_name = ? WHERE id = ?", (password_hash, full_name, existing['id']))
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': f'Đã nâng cấp tài khoản "{username}" thành Quản trị viên!'})

    password_hash = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (username, password_hash, full_name, email, phone, role, status)
        VALUES (?, ?, ?, ?, ?, 'admin', 'active')
    ''', (username, password_hash, full_name, email, phone))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Tạo tài khoản Quản trị viên "{username}" thành công!'})

@app.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def api_admin_reset_user_password(user_id):
    data = request.get_json() or {}
    new_password = data.get('new_password', '').strip() or '123456'

    conn = database.get_db_connection()
    user = conn.execute("SELECT id, username FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy tài khoản'}), 404

    new_hash = generate_password_hash(new_password)
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Đã đặt lại mật khẩu cho tài khoản "{user["username"]}" thành: {new_password}'})

@app.route('/api/admin/users/<int:user_id>/toggle-lock', methods=['POST'])
@admin_required
def api_admin_toggle_user_lock(user_id):
    if user_id == g.admin['id']:
        return jsonify({'success': False, 'message': 'Bạn không thể tự khóa tài khoản Admin đang đăng nhập của chính mình!'}), 400

    conn = database.get_db_connection()
    user = conn.execute("SELECT id, username, status FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy tài khoản'}), 404

    new_status = 'locked' if user['status'] == 'active' else 'active'
    conn.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
    conn.commit()
    conn.close()

    action_text = 'khóa' if new_status == 'locked' else 'mở khóa'
    return jsonify({'success': True, 'message': f'Đã {action_text} tài khoản "{user["username"]}" thành công', 'new_status': new_status})

# --- 3. Category Management ---

@app.route('/api/admin/categories', methods=['GET', 'POST'])
@admin_required
def api_admin_categories():
    conn = database.get_db_connection()
    if request.method == 'GET':
        categories = conn.execute('''
            SELECT c.*, COUNT(p.id) as product_count 
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY c.id ASC
        ''').fetchall()
        conn.close()
        return jsonify({'success': True, 'categories': [dict(c) for c in categories]})

    # POST: create category
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    profit_margin = float(data.get('profit_margin_percent', 20.0))

    if not code or not name:
        conn.close()
        return jsonify({'success': False, 'message': 'Mã loại và Tên loại không được để trống'}), 400

    existing = conn.execute("SELECT id FROM categories WHERE code = ?", (code,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': f'Mã loại "{code}" đã tồn tại'}), 400

    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO categories (code, name, description, status, profit_margin_percent)
        VALUES (?, ?, ?, 'active', ?)
    ''', (code, name, description, profit_margin))
    cat_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Thêm loại sản phẩm thành công', 'category_id': cat_id})

@app.route('/api/admin/categories/<int:cat_id>', methods=['PUT', 'DELETE'])
@admin_required
def api_admin_category_detail(cat_id):
    conn = database.get_db_connection()
    cat = conn.execute("SELECT * FROM categories WHERE id = ?", (cat_id,)).fetchone()
    if not cat:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy loại sản phẩm'}), 404

    if request.method == 'PUT':
        data = request.get_json() or {}
        code = data.get('code', '').strip().upper()
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        profit_margin = float(data.get('profit_margin_percent', cat['profit_margin_percent']))

        if not code or not name:
            conn.close()
            return jsonify({'success': False, 'message': 'Mã loại và Tên loại không được để trống'}), 400

        existing = conn.execute("SELECT id FROM categories WHERE code = ? AND id != ?", (code, cat_id)).fetchone()
        if existing:
            conn.close()
            return jsonify({'success': False, 'message': f'Mã loại "{code}" đã được sử dụng'}), 400

        conn.execute('''
            UPDATE categories SET code = ?, name = ?, description = ?, profit_margin_percent = ?
            WHERE id = ?
        ''', (code, name, description, profit_margin, cat_id))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật loại sản phẩm thành công'})

    # DELETE
    prod_count = conn.execute("SELECT COUNT(*) FROM products WHERE category_id = ?", (cat_id,)).fetchone()[0]
    if prod_count > 0:
        conn.close()
        return jsonify({'success': False, 'message': f'Không thể xóa vì có {prod_count} sản phẩm đang thuộc loại này! Hãy chọn Ẩn loại sản phẩm thay vì xóa.'}), 400

    conn.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Xóa loại sản phẩm thành công'})

@app.route('/api/admin/categories/<int:cat_id>/toggle-status', methods=['POST'])
@admin_required
def api_admin_category_toggle_status(cat_id):
    conn = database.get_db_connection()
    cat = conn.execute("SELECT id, name, status FROM categories WHERE id = ?", (cat_id,)).fetchone()
    if not cat:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy loại sản phẩm'}), 404

    new_status = 'hidden' if cat['status'] == 'active' else 'active'
    conn.execute("UPDATE categories SET status = ? WHERE id = ?", (new_status, cat_id))
    conn.commit()
    conn.close()
    action_text = 'ẩn' if new_status == 'hidden' else 'kích hoạt hiển thị'
    return jsonify({'success': True, 'message': f'Đã {action_text} loại sản phẩm "{cat["name"]}"', 'new_status': new_status})

# --- 4. Product Management ---

@app.route('/api/admin/products', methods=['GET', 'POST'])
@admin_required
def api_admin_products():
    conn = database.get_db_connection()
    if request.method == 'GET':
        category_id = request.args.get('category_id', type=int)
        search = request.args.get('search', '').strip()

        sql = '''
            SELECT p.*, c.name as category_name, c.profit_margin_percent as category_profit_margin
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        '''
        params = []
        if category_id:
            sql += " AND p.category_id = ?"
            params.append(category_id)
        if search:
            sql += " AND (p.name LIKE ? OR p.code LIKE ?)"
            wild = f"%{search}%"
            params.extend([wild, wild])

        sql += " ORDER BY p.id DESC"
        rows = conn.execute(sql, params).fetchall()
        conn.close()

        items = [database.calculate_product_prices(r) for r in rows]
        return jsonify({'success': True, 'products': items})

    # POST: create product
    data = request.get_json() or {}
    category_id = data.get('category_id')
    code = data.get('code', '').strip().upper()
    name = data.get('name', '').strip()
    image_url = data.get('image_url', '').strip()
    description = data.get('description', '').strip()
    cost_price = float(data.get('cost_price', 0.0) or 0.0)
    profit_margin = data.get('profit_margin_percent')
    if profit_margin is not None and profit_margin != "":
        profit_margin = float(profit_margin)
    else:
        profit_margin = None

    if not category_id or not code or not name:
        conn.close()
        return jsonify({'success': False, 'message': 'Vui lòng chọn loại sản phẩm, nhập mã và tên sản phẩm'}), 400

    existing = conn.execute("SELECT id FROM products WHERE code = ?", (code,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': f'Mã sản phẩm "{code}" đã tồn tại'}), 400

    if not image_url:
        image_url = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'

    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO products (category_id, code, name, image_url, description, cost_price, profit_margin_percent, status, stock_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0)
    ''', (category_id, code, name, image_url, description, cost_price, profit_margin))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Thêm sản phẩm mới thành công', 'product_id': new_id})

@app.route('/api/admin/products/<int:prod_id>', methods=['GET', 'PUT', 'DELETE'])
@admin_required
def api_admin_product_detail(prod_id):
    conn = database.get_db_connection()
    row = conn.execute('''
        SELECT p.*, c.name as category_name, c.profit_margin_percent as category_profit_margin
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ''', (prod_id,)).fetchone()

    if not row:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy sản phẩm'}), 404

    if request.method == 'GET':
        conn.close()
        item = database.calculate_product_prices(row)
        return jsonify({'success': True, 'product': item})

    if request.method == 'PUT':
        data = request.get_json() or {}
        category_id = data.get('category_id', row['category_id'])
        code = data.get('code', row['code']).strip().upper()
        name = data.get('name', row['name']).strip()
        image_url = data.get('image_url', row['image_url']).strip()
        description = data.get('description', row['description']).strip()
        cost_price = float(data.get('cost_price', row['cost_price']) or 0.0)
        
        profit_margin = data.get('profit_margin_percent')
        if profit_margin is not None and profit_margin != "":
            profit_margin = float(profit_margin)
        else:
            profit_margin = None

        if not category_id or not code or not name:
            conn.close()
            return jsonify({'success': False, 'message': 'Vui lòng chọn loại sản phẩm, nhập mã và tên sản phẩm'}), 400

        existing = conn.execute("SELECT id FROM products WHERE code = ? AND id != ?", (code, prod_id)).fetchone()
        if existing:
            conn.close()
            return jsonify({'success': False, 'message': f'Mã sản phẩm "{code}" đã được sử dụng'}), 400

        conn.execute('''
            UPDATE products 
            SET category_id = ?, code = ?, name = ?, image_url = ?, description = ?, cost_price = ?, profit_margin_percent = ?
            WHERE id = ?
        ''', (category_id, code, name, image_url, description, cost_price, profit_margin, prod_id))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật thông tin sản phẩm thành công'})

    # DELETE
    # Check if used in order_items or import_receipt_items
    orders_using = conn.execute("SELECT COUNT(*) FROM order_items WHERE product_id = ?", (prod_id,)).fetchone()[0]
    imports_using = conn.execute("SELECT COUNT(*) FROM import_receipt_items WHERE product_id = ?", (prod_id,)).fetchone()[0]

    if orders_using > 0 or imports_using > 0:
        conn.close()
        return jsonify({
            'success': False, 
            'message': f'Sản phẩm đã có lịch sử trong {orders_using} đơn hàng hoặc {imports_using} phiếu nhập. Để đảm bảo toàn vẹn dữ liệu, hãy chọn chức năng Ẩn sản phẩm thay vì xóa.'
        }), 400

    conn.execute("DELETE FROM products WHERE id = ?", (prod_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa sản phẩm thành công'})

@app.route('/api/admin/products/<int:prod_id>/toggle-status', methods=['POST'])
@admin_required
def api_admin_product_toggle_status(prod_id):
    conn = database.get_db_connection()
    p = conn.execute("SELECT id, name, status FROM products WHERE id = ?", (prod_id,)).fetchone()
    if not p:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy sản phẩm'}), 404

    new_status = 'hidden' if p['status'] == 'active' else 'active'
    conn.execute("UPDATE products SET status = ? WHERE id = ?", (new_status, prod_id))
    conn.commit()
    conn.close()
    action_text = 'ẩn' if new_status == 'hidden' else 'kích hoạt hiển thị'
    return jsonify({'success': True, 'message': f'Đã {action_text} sản phẩm "{p["name"]}"', 'new_status': new_status})

# --- 5. Stock Import Management (Quản lý Nhập sản phẩm) ---

@app.route('/api/admin/imports', methods=['GET', 'POST'])
@admin_required
def api_admin_imports():
    conn = database.get_db_connection()
    if request.method == 'GET':
        code = request.args.get('code', '').strip()
        status = request.args.get('status', '').strip()
        from_date = request.args.get('from_date', '').strip()
        to_date = request.args.get('to_date', '').strip()

        sql = "SELECT * FROM import_receipts WHERE 1=1"
        params = []
        if code:
            sql += " AND receipt_code LIKE ?"
            params.append(f"%{code}%")
        if status:
            sql += " AND status = ?"
            params.append(status)
        if from_date:
            sql += " AND date(import_date) >= date(?)"
            params.append(from_date)
        if to_date:
            sql += " AND date(import_date) <= date(?)"
            params.append(to_date)

        sql += " ORDER BY import_date DESC, id DESC"
        receipts = conn.execute(sql, params).fetchall()

        result = []
        for r in receipts:
            r_dict = dict(r)
            item_count = conn.execute("SELECT COUNT(*), SUM(quantity) FROM import_receipt_items WHERE receipt_id = ?", (r['id'],)).fetchone()
            r_dict['item_types_count'] = item_count[0] or 0
            r_dict['total_quantity'] = item_count[1] or 0
            result.append(r_dict)

        conn.close()
        return jsonify({'success': True, 'receipts': result})

    # POST: create import receipt
    data = request.get_json() or {}
    import_date = data.get('import_date', datetime.now().strftime('%Y-%m-%d'))
    notes = data.get('notes', '').strip()
    items = data.get('items', [])

    if not items or len(items) == 0:
        conn.close()
        return jsonify({'success': False, 'message': 'Phiếu nhập phải có ít nhất 1 sản phẩm'}), 400

    receipt_code = f"PN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    total_cost = sum(float(i.get('import_price', 0)) * int(i.get('quantity', 0)) for i in items)

    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO import_receipts (receipt_code, import_date, status, total_cost, notes)
        VALUES (?, ?, 'draft', ?, ?)
    ''', (receipt_code, import_date, total_cost, notes))
    receipt_id = cursor.lastrowid

    for it in items:
        prod_id = it['product_id']
        price = float(it['import_price'])
        qty = int(it['quantity'])
        subtotal = price * qty
        cursor.execute('''
            INSERT INTO import_receipt_items (receipt_id, product_id, import_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?)
        ''', (receipt_id, prod_id, price, qty, subtotal))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Đã tạo phiếu nhập {receipt_code} (Bản nháp)', 'receipt_id': receipt_id, 'receipt_code': receipt_code})

@app.route('/api/admin/imports/<int:receipt_id>', methods=['GET', 'PUT', 'DELETE'])
@admin_required
def api_admin_import_detail(receipt_id):
    conn = database.get_db_connection()
    receipt = conn.execute("SELECT * FROM import_receipts WHERE id = ?", (receipt_id,)).fetchone()
    if not receipt:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy phiếu nhập'}), 404

    if request.method == 'GET':
        r_dict = dict(receipt)
        items = conn.execute('''
            SELECT iri.*, p.code as product_code, p.name as product_name, p.stock_quantity as current_stock
            FROM import_receipt_items iri
            JOIN products p ON iri.product_id = p.id
            WHERE iri.receipt_id = ?
        ''', (receipt_id,)).fetchall()
        r_dict['items'] = [dict(i) for i in items]
        conn.close()
        return jsonify({'success': True, 'receipt': r_dict})

    if request.method == 'PUT':
        # ONLY editable before completion!
        if receipt['status'] == 'completed':
            conn.close()
            return jsonify({'success': False, 'message': 'Phiếu nhập đã hoàn thành không thể sửa đổi!'}), 400

        data = request.get_json() or {}
        import_date = data.get('import_date', receipt['import_date'])
        notes = data.get('notes', receipt['notes']).strip()
        items = data.get('items', [])

        if not items or len(items) == 0:
            conn.close()
            return jsonify({'success': False, 'message': 'Phiếu nhập phải có ít nhất 1 sản phẩm'}), 400

        total_cost = sum(float(i.get('import_price', 0)) * int(i.get('quantity', 0)) for i in items)

        cursor = conn.cursor()
        cursor.execute('''
            UPDATE import_receipts SET import_date = ?, total_cost = ?, notes = ? WHERE id = ?
        ''', (import_date, total_cost, notes, receipt_id))

        # Replace items
        cursor.execute("DELETE FROM import_receipt_items WHERE receipt_id = ?", (receipt_id,))
        for it in items:
            prod_id = it['product_id']
            price = float(it['import_price'])
            qty = int(it['quantity'])
            subtotal = price * qty
            cursor.execute('''
                INSERT INTO import_receipt_items (receipt_id, product_id, import_price, quantity, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ''', (receipt_id, prod_id, price, qty, subtotal))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật phiếu nhập thành công'})

    # DELETE
    if receipt['status'] == 'completed':
        conn.close()
        return jsonify({'success': False, 'message': 'Không thể xóa phiếu nhập đã hoàn thành!'}), 400

    conn.execute("DELETE FROM import_receipts WHERE id = ?", (receipt_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa phiếu nhập bản nháp'})

@app.route('/api/admin/imports/<int:receipt_id>/complete', methods=['POST'])
@admin_required
def api_admin_import_complete(receipt_id):
    conn = database.get_db_connection()
    receipt = conn.execute("SELECT * FROM import_receipts WHERE id = ?", (receipt_id,)).fetchone()
    if not receipt:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy phiếu nhập'}), 404

    if receipt['status'] == 'completed':
        conn.close()
        return jsonify({'success': False, 'message': 'Phiếu nhập này đã hoàn thành trước đó rồi!'}), 400

    items = conn.execute("SELECT * FROM import_receipt_items WHERE receipt_id = ?", (receipt_id,)).fetchall()
    if not items:
        conn.close()
        return jsonify({'success': False, 'message': 'Phiếu nhập không có sản phẩm nào'}), 400

    cursor = conn.cursor()
    # Update stock quantity and cost price for each product
    for it in items:
        cursor.execute('''
            UPDATE products 
            SET stock_quantity = stock_quantity + ?,
                cost_price = ?
            WHERE id = ?
        ''', (it['quantity'], it['import_price'], it['product_id']))

    # Mark receipt as completed
    cursor.execute("UPDATE import_receipts SET status = 'completed' WHERE id = ?", (receipt_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Phiếu nhập {receipt["receipt_code"]} đã hoàn thành! Đã cộng tồn kho và cập nhật giá vốn.'})

# --- 6. Pricing & Profit Margin Management ---

@app.route('/api/admin/pricing', methods=['GET'])
@admin_required
def api_admin_pricing_overview():
    conn = database.get_db_connection()
    categories = conn.execute("SELECT * FROM categories ORDER BY name ASC").fetchall()
    products_rows = conn.execute('''
        SELECT p.*, c.name as category_name, c.profit_margin_percent as category_profit_margin
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY c.id ASC, p.id ASC
    ''').fetchall()
    conn.close()

    products = [database.calculate_product_prices(r) for r in products_rows]
    return jsonify({
        'success': True,
        'categories': [dict(c) for c in categories],
        'products': products
    })

@app.route('/api/admin/pricing/category/<int:cat_id>', methods=['PUT'])
@admin_required
def api_admin_update_category_margin(cat_id):
    data = request.get_json() or {}
    profit_margin = float(data.get('profit_margin_percent', 20.0))

    if profit_margin < 0:
        return jsonify({'success': False, 'message': 'Tỉ lệ % lợi nhuận không được âm'}), 400

    conn = database.get_db_connection()
    cat = conn.execute("SELECT id, name FROM categories WHERE id = ?", (cat_id,)).fetchone()
    if not cat:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy loại sản phẩm'}), 404

    conn.execute("UPDATE categories SET profit_margin_percent = ? WHERE id = ?", (profit_margin, cat_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f'Đã cập nhật tỉ lệ lợi nhuận cho loại "{cat["name"]}" thành {profit_margin}%'})

@app.route('/api/admin/pricing/product/<int:prod_id>', methods=['PUT'])
@admin_required
def api_admin_update_product_margin(prod_id):
    data = request.get_json() or {}
    margin_val = data.get('profit_margin_percent')
    cost_val = data.get('cost_price')

    conn = database.get_db_connection()
    prod = conn.execute("SELECT id, name FROM products WHERE id = ?", (prod_id,)).fetchone()
    if not prod:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy sản phẩm'}), 404

    updates = []
    params = []

    if margin_val is not None and margin_val != "":
        margin_f = float(margin_val)
        if margin_f < 0:
            conn.close()
            return jsonify({'success': False, 'message': 'Tỉ lệ % lợi nhuận không được âm'}), 400
        updates.append("profit_margin_percent = ?")
        params.append(margin_f)
    elif margin_val == "" or margin_val is None:
        # Reset to use category margin
        updates.append("profit_margin_percent = NULL")

    if cost_val is not None and cost_val != "":
        cost_f = float(cost_val)
        if cost_f < 0:
            conn.close()
            return jsonify({'success': False, 'message': 'Giá vốn không được âm'}), 400
        updates.append("cost_price = ?")
        params.append(cost_f)

    if updates:
        sql = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
        params.append(prod_id)
        conn.execute(sql, params)
        conn.commit()

    conn.close()
    return jsonify({'success': True, 'message': f'Đã cập nhật thông tin giá cho "{prod["name"]}"'})

# --- 7. Order Management ---

@app.route('/api/admin/orders', methods=['GET'])
@admin_required
def api_admin_orders():
    """
    Search & filter orders by:
    1. Order date range (from_date, to_date)
    2. Order status (pending, processing, delivered, cancelled)
    """
    status = request.args.get('status', '').strip()
    from_date = request.args.get('from_date', '').strip()
    to_date = request.args.get('to_date', '').strip()
    search = request.args.get('search', '').strip()

    sql = '''
        SELECT o.*, u.username, u.full_name as customer_account_name 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
    '''
    params = []

    if status:
        sql += " AND o.order_status = ?"
        params.append(status)
    if from_date:
        sql += " AND date(o.created_at) >= date(?)"
        params.append(from_date)
    if to_date:
        sql += " AND date(o.created_at) <= date(?)"
        params.append(to_date)
    if search:
        sql += " AND (o.order_code LIKE ? OR o.recipient_name LIKE ? OR o.recipient_phone LIKE ?)"
        wild = f"%{search}%"
        params.extend([wild, wild, wild])

    sql += " ORDER BY o.created_at DESC, o.id DESC"

    conn = database.get_db_connection()
    orders = conn.execute(sql, params).fetchall()

    result = []
    for ord_row in orders:
        ord_dict = dict(ord_row)
        items_count = conn.execute("SELECT COUNT(*), SUM(quantity) FROM order_items WHERE order_id = ?", (ord_dict['id'],)).fetchone()
        ord_dict['total_items_type'] = items_count[0] or 0
        ord_dict['total_items_qty'] = items_count[1] or 0
        result.append(ord_dict)

    conn.close()
    return jsonify({'success': True, 'orders': result})

@app.route('/api/admin/orders/<int:order_id>', methods=['GET'])
@admin_required
def api_admin_order_detail(order_id):
    conn = database.get_db_connection()
    order = conn.execute('''
        SELECT o.*, u.username, u.email as user_email, u.phone as user_phone, u.full_name as user_full_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
    ''', (order_id,)).fetchone()

    if not order:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy đơn hàng'}), 404

    order_dict = dict(order)
    items = conn.execute('''
        SELECT oi.*, p.code as product_code, p.image_url 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ''', (order_id,)).fetchall()
    order_dict['items'] = [dict(i) for i in items]

    conn.close()
    return jsonify({'success': True, 'order': order_dict})

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def api_admin_update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get('order_status')
    payment_status = data.get('payment_status')

    valid_statuses = ['pending', 'processing', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': 'Trạng thái đơn hàng không hợp lệ'}), 400

    conn = database.get_db_connection()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if not order:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy đơn hàng'}), 404

    old_status = order['order_status']

    # If cancelling an active order, restore stock
    cursor = conn.cursor()
    if new_status == 'cancelled' and old_status != 'cancelled':
        items = cursor.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
        for it in items:
            cursor.execute("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?", (it['quantity'], it['product_id']))

    # If uncancelling an order, re-deduct stock
    elif old_status == 'cancelled' and new_status != 'cancelled':
        items = cursor.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
        for it in items:
            cursor.execute("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", (it['quantity'], it['product_id']))

    # Automatic payment status update on delivery
    if new_status == 'delivered' and not payment_status:
        payment_status = 'paid'

    if payment_status:
        cursor.execute("UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?", (new_status, payment_status, order_id))
    else:
        cursor.execute("UPDATE orders SET order_status = ? WHERE id = ?", (new_status, order_id))

    conn.commit()
    conn.close()

    status_labels = {
        'pending': 'Mới đặt',
        'processing': 'Đã xử lý',
        'delivered': 'Đã giao',
        'cancelled': 'Hủy'
    }

    return jsonify({'success': True, 'message': f'Đã cập nhật trạng thái đơn {order["order_code"]} thành: {status_labels.get(new_status, new_status)}'})

# --- 8. Inventory & Nhập - Xuất - Tồn Report ---

@app.route('/api/admin/inventory/current', methods=['GET'])
@admin_required
def api_admin_inventory_current():
    """
    Lookup current stock of a product, or products by category.
    Includes low-stock alerts.
    """
    category_id = request.args.get('category_id', type=int)
    product_id = request.args.get('product_id', type=int)
    low_stock_only = request.args.get('low_stock_only', 'false').lower() == 'true'
    threshold = request.args.get('threshold', 5, type=int)

    conn = database.get_db_connection()
    sql = '''
        SELECT p.id, p.code, p.name, p.image_url, p.cost_price, p.stock_quantity, p.status,
               c.id as category_id, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    '''
    params = []
    if category_id:
        sql += " AND p.category_id = ?"
        params.append(category_id)
    if product_id:
        sql += " AND p.id = ?"
        params.append(product_id)
    if low_stock_only:
        sql += " AND p.stock_quantity <= ?"
        params.append(threshold)

    sql += " ORDER BY p.stock_quantity ASC, p.id ASC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict(r)
        d['is_low_stock'] = d['stock_quantity'] <= threshold
        d['stock_status'] = 'Hết hàng' if d['stock_quantity'] == 0 else ('Sắp hết hàng' if d['is_low_stock'] else 'Còn hàng')
        items.append(d)

    return jsonify({'success': True, 'inventory': items, 'threshold': threshold})

@app.route('/api/admin/inventory/report', methods=['GET'])
@admin_required
def api_admin_inventory_report():
    """
    Tra cứu số lượng nhập – xuất – tồn của một sản phẩm, của sản phẩm theo loại trong một khoảng thời gian.
    Parameters:
    - from_date (YYYY-MM-DD)
    - to_date (YYYY-MM-DD)
    - category_id (optional)
    - product_id (optional)
    """
    from_date = request.args.get('from_date', '').strip()
    to_date = request.args.get('to_date', '').strip()
    category_id = request.args.get('category_id', type=int)
    product_id = request.args.get('product_id', type=int)

    # Defaults: current month if not specified
    if not from_date:
        from_date = datetime.now().strftime('%Y-%m-01')
    if not to_date:
        to_date = datetime.now().strftime('%Y-%m-%d')

    conn = database.get_db_connection()

    # Target products
    sql = '''
        SELECT p.id, p.code, p.name, p.cost_price, p.stock_quantity,
               c.id as category_id, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    '''
    params = []
    if category_id:
        sql += " AND p.category_id = ?"
        params.append(category_id)
    if product_id:
        sql += " AND p.id = ?"
        params.append(product_id)

    sql += " ORDER BY c.name ASC, p.name ASC"
    products = conn.execute(sql, params).fetchall()

    report = []
    total_opening = 0
    total_import = 0
    total_export = 0
    total_closing = 0

    for p in products:
        pid = p['id']

        # 1. Total Completed Imports BEFORE from_date
        imp_before = conn.execute('''
            SELECT SUM(iri.quantity) 
            FROM import_receipt_items iri
            JOIN import_receipts ir ON iri.receipt_id = ir.id
            WHERE iri.product_id = ? AND ir.status = 'completed' AND date(ir.import_date) < date(?)
        ''', (pid, from_date)).fetchone()[0] or 0

        # 2. Total Non-cancelled Exports (Orders) BEFORE from_date
        exp_before = conn.execute('''
            SELECT SUM(oi.quantity) 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = ? AND o.order_status != 'cancelled' AND date(o.created_at) < date(?)
        ''', (pid, from_date)).fetchone()[0] or 0

        # Opening stock
        opening_stock = max(0, imp_before - exp_before)

        # 3. Imports DURING period [from_date, to_date]
        imp_period = conn.execute('''
            SELECT SUM(iri.quantity) 
            FROM import_receipt_items iri
            JOIN import_receipts ir ON iri.receipt_id = ir.id
            WHERE iri.product_id = ? AND ir.status = 'completed' 
              AND date(ir.import_date) >= date(?) AND date(ir.import_date) <= date(?)
        ''', (pid, from_date, to_date)).fetchone()[0] or 0

        # 4. Exports DURING period [from_date, to_date]
        exp_period = conn.execute('''
            SELECT SUM(oi.quantity) 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = ? AND o.order_status != 'cancelled'
              AND date(o.created_at) >= date(?) AND date(o.created_at) <= date(?)
        ''', (pid, from_date, to_date)).fetchone()[0] or 0

        # Closing stock
        closing_stock = max(0, opening_stock + imp_period - exp_period)

        report.append({
            'product_id': pid,
            'product_code': p['code'],
            'product_name': p['name'],
            'category_name': p['category_name'],
            'opening_stock': opening_stock,
            'import_qty': imp_period,
            'export_qty': exp_period,
            'closing_stock': closing_stock,
            'current_actual_stock': p['stock_quantity']
        })

        total_opening += opening_stock
        total_import += imp_period
        total_export += exp_period
        total_closing += closing_stock

    conn.close()

    return jsonify({
        'success': True,
        'from_date': from_date,
        'to_date': to_date,
        'report': report,
        'summary': {
            'total_opening': total_opening,
            'total_import': total_import,
            'total_export': total_export,
            'total_closing': total_closing
        }
    })


if __name__ == '__main__':
    print("Starting Musical Instruments Web Store on http://127.0.0.1:5000 ...")
    app.run(debug=True, host='0.0.0.0', port=5000)
