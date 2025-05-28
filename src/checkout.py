from flask import Blueprint, render_template, request, jsonify, url_for

from src.models import db, MenuItem, Order, OrderItem

checkout = Blueprint('checkout', __name__, template_folder='templates')

@checkout.route('/checkout')
def new_order():
    return render_template("apps/checkout.html")

@checkout.route('/checkout/save', methods=['POST'])
def save_order():
    data = request.get_json()
    
    try:
        # Calculate subtotal from actual prices
        subtotal = 0
        for item in data['products']:
            menu_item = MenuItem.query.get(item['id'])
            if not menu_item:
                raise ValueError(f"Menu item {item['id']} not found")
            subtotal += menu_item.price * item['quantity']

        # Calculate discount
        discount = 0
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value', 0)
        
        if discount_type and discount_value:
            if discount_type == 'percent':
                if not 0 <= discount_value <= 100:
                    raise ValueError("Invalid discount percentage")
                discount = subtotal * (discount_value / 100)
            elif discount_type == 'fixed':
                if discount_value < 0:
                    raise ValueError("Invalid fixed discount amount")
                discount = min(discount_value, subtotal)
            else:
                raise ValueError("Invalid discount type")

        total = subtotal - discount

        # Create order
        new_order = Order(
            subtotal=subtotal,
            discount_type=discount_type,
            discount_value=discount_value,
            order_type=data.get('order_type'),
            total=total
        )

        db.session.add(new_order)
        db.session.flush()

        # Process items and inventory
        for item in data['products']:
            menu_item = MenuItem.query.get(item['id'])
            if menu_item.quantity < item['quantity']:
                raise ValueError(f"Not enough stock for {menu_item.name}")
            menu_item.quantity -= item['quantity']

            order_item = OrderItem(
                order_id=new_order.id,
                item_id=item['id'],
                quantity=item['quantity'],
                item_name=menu_item.name,
                item_price=menu_item.price,
                category_name=menu_item.category.name
            )
            db.session.add(order_item)

        db.session.commit()
        return jsonify(new_order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
