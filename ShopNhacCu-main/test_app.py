import unittest
import json
import os
import database
from app import app
from seed_data import seed_database

class MusicStoreTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database is seeded
        seed_database()

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # ---------------- 1. Authentication Tests ----------------
    def test_01_customer_auth(self):
        import time
        unique_user = f"testuser_{int(time.time()*1000)}"
        # Register new customer
        reg_res = self.app.post('/api/auth/register', json={
            'username': unique_user,
            'password': 'password123',
            'full_name': 'Khách Hàng Test',
            'email': f'{unique_user}@example.com',
            'phone': '0912999888',
            'address': '456 Phố Huế, Hai Bà Trưng, Hà Nội'
        })
        self.assertEqual(reg_res.status_code, 200)
        data = json.loads(reg_res.data)
        self.assertTrue(data['success'])

        # Login
        login_res = self.app.post('/api/auth/login', json={
            'username': unique_user,
            'password': 'password123'
        })
        self.assertEqual(login_res.status_code, 200)

        # Login with locked user should fail with 403
        locked_res = self.app.post('/api/auth/login', json={
            'username': 'khachhang_bi_khoa',
            'password': '123456'
        })
        self.assertEqual(locked_res.status_code, 403)

    def test_02_admin_auth(self):
        # Admin login
        res = self.app.post('/api/admin/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])

    # ---------------- 2. Products Catalog & Search ----------------
    def test_03_products_catalog_and_search(self):
        # List products with pagination
        res = self.app.get('/api/products?page=1&limit=4')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['products']), 4)
        self.assertGreater(data['pagination']['total_items'], 0)

        # Basic search
        search_res = self.app.get('/api/products?q=Yamaha')
        s_data = json.loads(search_res.data)
        self.assertTrue(s_data['success'])
        self.assertGreater(len(s_data['products']), 0)
        for p in s_data['products']:
            self.assertTrue('Yamaha' in p['name'] or 'Yamaha' in p['description'] or 'YAM' in p['code'])

        # Advanced search (name + category + price range)
        adv_res = self.app.get('/api/products?q=Guitar&category_id=1&min_price=1000000&max_price=50000000')
        adv_data = json.loads(adv_res.data)
        self.assertTrue(adv_data['success'])
        self.assertGreater(len(adv_data['products']), 0)

    # ---------------- 3. Cart & Checkout ----------------
    def test_04_cart_and_checkout(self):
        # Must login to use cart
        self.app.post('/api/auth/login', json={
            'username': 'khachhang1',
            'password': '123456'
        })

        # Add to cart
        add_res = self.app.post('/api/cart/add', json={
            'product_id': 1, # Yamaha F310
            'quantity': 2
        })
        self.assertEqual(add_res.status_code, 200)
        a_data = json.loads(add_res.data)
        self.assertTrue(a_data['success'])

        # Get cart
        cart_res = self.app.get('/api/cart')
        c_data = json.loads(cart_res.data)
        self.assertTrue(c_data['success'])
        self.assertGreater(len(c_data['cart_items']), 0)

        # Checkout using profile address
        checkout_res = self.app.post('/api/checkout', json={
            'address_mode': 'profile',
            'payment_method': 'cod',
            'notes': 'Test order checkout'
        })
        self.assertEqual(checkout_res.status_code, 200)
        chk_data = json.loads(checkout_res.data)
        self.assertTrue(chk_data['success'])
        self.assertIn('DH-', chk_data['order_code'])

        # Customer orders list
        orders_res = self.app.get('/api/orders')
        o_data = json.loads(orders_res.data)
        self.assertTrue(o_data['success'])
        self.assertGreater(len(o_data['orders']), 0)

    # ---------------- 4. Admin Management Flows ----------------
    def test_05_admin_operations(self):
        # Admin login
        self.app.post('/api/admin/login', json={'username': 'admin', 'password': 'admin123'})

        # Users list
        users_res = self.app.get('/api/admin/users')
        u_data = json.loads(users_res.data)
        self.assertTrue(u_data['success'])

        # Reset password & Toggle lock on a customer
        customer_users = [u for u in u_data['users'] if u['role'] == 'customer']
        user_id = customer_users[0]['id']
        reset_res = self.app.post(f'/api/admin/users/{user_id}/reset-password', json={'new_password': 'newpass123'})
        self.assertTrue(json.loads(reset_res.data)['success'])

        # Toggle user lock
        lock_res = self.app.post(f'/api/admin/users/{user_id}/toggle-lock')
        self.assertTrue(json.loads(lock_res.data)['success'])

        # Add & Edit Category
        import time
        ts = int(time.time() * 1000) % 1000000
        cat_code = f"CAT{ts}"
        prod_code = f"PRD{ts}"

        cat_res = self.app.post('/api/admin/categories', json={
            'code': cat_code,
            'name': f'Loại Thử Nghiệm {ts}',
            'description': 'Mô tả loại thử nghiệm',
            'profit_margin_percent': 25.0
        })
        cat_data = json.loads(cat_res.data)
        self.assertTrue(cat_data['success'])
        test_cat_id = cat_data['category_id']

        # Edit category
        edit_cat = self.app.put(f'/api/admin/categories/{test_cat_id}', json={
            'code': cat_code,
            'name': 'Loại Thử Nghiệm Sửa Đổi',
            'description': 'Mô tả cập nhật',
            'profit_margin_percent': 28.0
        })
        self.assertTrue(json.loads(edit_cat.data)['success'])

        # Add Product
        prod_res = self.app.post('/api/admin/products', json={
            'category_id': test_cat_id,
            'code': prod_code,
            'name': 'Sản Phẩm Thử Nghiệm',
            'image_url': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
            'cost_price': 1000000,
            'profit_margin_percent': 30.0,
            'description': 'Thông tin sản phẩm thử nghiệm'
        })
        p_data = json.loads(prod_res.data)
        self.assertTrue(p_data['success'])
        test_prod_id = p_data['product_id']

        # Edit Product: fetch existing info first (prefill test)
        get_p = self.app.get(f'/api/admin/products/{test_prod_id}')
        curr_p = json.loads(get_p.data)['product']
        self.assertEqual(curr_p['code'], prod_code)
        self.assertEqual(curr_p['cost_price'], 1000000)

        # Update product
        edit_p = self.app.put(f'/api/admin/products/{test_prod_id}', json={
            'category_id': test_cat_id,
            'code': prod_code,
            'name': 'Sản Phẩm Thử Nghiệm Đã Sửa',
            'image_url': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
            'cost_price': 1200000,
            'profit_margin_percent': 35.0,
            'description': 'Mô tả chi tiết đã cập nhật'
        })
        self.assertTrue(json.loads(edit_p.data)['success'])

        # ---------------- 5. Import Receipts ----------------
        # Create draft import receipt
        imp_res = self.app.post('/api/admin/imports', json={
            'import_date': '2026-09-10',
            'notes': 'Nhập thử nghiệm',
            'items': [
                {'product_id': test_prod_id, 'import_price': 1100000, 'quantity': 10}
            ]
        })
        imp_data = json.loads(imp_res.data)
        self.assertTrue(imp_data['success'])
        receipt_id = imp_data['receipt_id']

        # Edit draft receipt (allowed before completion)
        edit_imp = self.app.put(f'/api/admin/imports/{receipt_id}', json={
            'import_date': '2026-09-10',
            'notes': 'Nhập thử nghiệm cập nhật',
            'items': [
                {'product_id': test_prod_id, 'import_price': 1150000, 'quantity': 15}
            ]
        })
        self.assertTrue(json.loads(edit_imp.data)['success'])

        # Complete receipt
        comp_res = self.app.post(f'/api/admin/imports/{receipt_id}/complete')
        self.assertTrue(json.loads(comp_res.data)['success'])

        # Verify editing completed receipt is rejected
        rejected_edit = self.app.put(f'/api/admin/imports/{receipt_id}', json={
            'import_date': '2026-09-10',
            'notes': 'Không thể sửa sau khi hoàn thành',
            'items': [{'product_id': test_prod_id, 'import_price': 1000000, 'quantity': 5}]
        })
        self.assertEqual(rejected_edit.status_code, 400)

        # Check that stock and cost price were updated
        p_updated = json.loads(self.app.get(f'/api/admin/products/{test_prod_id}').data)['product']
        self.assertEqual(p_updated['stock_quantity'], 15)
        self.assertEqual(p_updated['cost_price'], 1150000)

        # ---------------- 6. Pricing ----------------
        pricing_res = self.app.get('/api/admin/pricing')
        self.assertTrue(json.loads(pricing_res.data)['success'])

        # ---------------- 7. Orders Management & Filter ----------------
        orders_filter = self.app.get('/api/admin/orders?status=pending')
        ord_data = json.loads(orders_filter.data)
        self.assertTrue(ord_data['success'])

        # ---------------- 8. Inventory & Nhập - Xuất - Tồn ----------------
        cur_inv = self.app.get('/api/admin/inventory/current')
        self.assertTrue(json.loads(cur_inv.data)['success'])

        nxt_report = self.app.get('/api/admin/inventory/report?from_date=2026-08-01&to_date=2026-09-30')
        rep_data = json.loads(nxt_report.data)
        self.assertTrue(rep_data['success'])
        self.assertIn('summary', rep_data)
        self.assertIn('total_closing', rep_data['summary'])

if __name__ == '__main__':
    unittest.main()
