from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()
users = SQLAlchemy()

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_on = db.Column(db.DateTime, default=datetime.now)
    items = db.relationship('MenuItem', backref='category', lazy=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_on': self.created_on.strftime('%Y-%m-%d %H:%M:%S')
        }

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    image_url = db.Column(db.String(255))
    created_on = db.Column(db.DateTime, default=datetime.now)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else '',
            'image_url': self.image_url,
            'created_on': self.created_on.strftime('%Y-%m-%d %H:%M:%S'),
            'quantity': self.quantity,
        }
        
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subtotal = db.Column(db.Float, nullable=False)
    discount_type = db.Column(db.String(10), default='fixed')  # 'percent' or 'fixed'
    discount_value = db.Column(db.Float, default=0)
    total = db.Column(db.Float, nullable=False)
    order_type = db.Column(db.String(10), nullable=False) # 'Takeout' or 'Dine in'
    created_on = db.Column(db.DateTime, default=datetime.now)
    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'subtotal': self.subtotal,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'total': self.total,
            'order_type': self.order_type,
            'created_on': self.created_on.strftime('%Y-%m-%d %H:%M:%S'),
            'items': [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id', ondelete="CASCADE"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id', ondelete="CASCADE"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    menu_item = db.relationship('MenuItem')
    item_name = db.Column(db.String(100), nullable=False)
    item_price = db.Column(db.Float, nullable=False)
    category_name = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.item_name,
            'price': self.item_price,
            'quantity': self.quantity,
            'category': self.category_name
        }
