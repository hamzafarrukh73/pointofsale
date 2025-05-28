from flask import Blueprint, render_template, jsonify

from src.models import db, Order

history = Blueprint('history', __name__, template_folder='templates')

@history.route('/history')
def orders_history():
    return render_template("apps/history.html")

@history.route('/history/fetch', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.created_on.desc()).all()
    return jsonify([order.to_dict() for order in orders])

@history.route('/history/fetch/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify(order.to_dict())

@history.route('/history/delete/<int:id>', methods=['POST'])
def delete_order(id):
    order = Order.query.get_or_404(id)
    db.session.delete(order)
    db.session.commit()
    return '', 204
