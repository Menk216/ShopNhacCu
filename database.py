import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'music_store.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            role TEXT NOT NULL DEFAULT 'customer',
            status TEXT NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT (datetime('now', 'localtime'))
        );
    ''')

    # 2. Categories Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            profit_margin_percent REAL NOT NULL DEFAULT 20.0,
            created_at DATETIME DEFAULT (datetime('now', 'localtime'))
        );
    ''')

    # 3. Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            description TEXT,
            cost_price REAL NOT NULL DEFAULT 0.0,
            profit_margin_percent REAL,
            status TEXT NOT NULL DEFAULT 'active',
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        );
    ''')

    # 4. Import Receipts Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS import_receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_code TEXT UNIQUE NOT NULL,
            import_date DATE NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            total_cost REAL NOT NULL DEFAULT 0.0,
            notes TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime'))
        );
    ''')

    # 5. Import Receipt Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS import_receipt_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            import_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (receipt_id) REFERENCES import_receipts (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id)
        );
    ''')

    # 6. Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_code TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            recipient_name TEXT NOT NULL,
            recipient_phone TEXT NOT NULL,
            recipient_address TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'cod',
            payment_status TEXT NOT NULL DEFAULT 'unpaid',
            order_status TEXT NOT NULL DEFAULT 'pending',
            total_amount REAL NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    ''')

    # 7. Order Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            unit_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id)
        );
    ''')

    # 8. Cart Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        );
    ''')

    conn.commit()
    conn.close()

def calculate_product_prices(row_or_dict):
    """
    Computes effective profit margin and selling price for a product.
    Formula: Selling Price = Cost Price * (1 + Profit Margin % / 100)
    """
    d = dict(row_or_dict)
    cost_price = float(d.get('cost_price') or 0.0)
    
    # Margin priority: product margin > category margin > 20.0%
    prod_margin = d.get('profit_margin_percent')
    cat_margin = d.get('category_profit_margin')
    
    if prod_margin is not None and prod_margin != "":
        effective_margin = float(prod_margin)
        is_custom_margin = True
    elif cat_margin is not None and cat_margin != "":
        effective_margin = float(cat_margin)
        is_custom_margin = False
    else:
        effective_margin = 20.0
        is_custom_margin = False

    selling_price = round(cost_price * (1 + effective_margin / 100.0), -3) # Làm tròn nghìn đồng
    if selling_price < 0:
        selling_price = 0.0

    d['effective_margin'] = effective_margin
    d['is_custom_margin'] = is_custom_margin
    d['selling_price'] = selling_price
    return d
