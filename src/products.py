from datetime import datetime

from flask import Blueprint, render_template, request, jsonify, current_app
from werkzeug.utils import secure_filename

from src.models import db, MenuItem

products = Blueprint('products', __name__, template_folder='templates')

@products.route('/products')
def menu_items():
    return render_template("apps/products.html")

@products.route('/products/fetch')
def get_products():
    products = MenuItem.query.filter_by(is_active=True).all()
    return jsonify([product.to_dict() for product in products])

@products.route('/products/add', methods=['POST'])
def add_product():
    name = request.form.get('name')
    price = float(request.form.get('price'))
    category_id = int(request.form.get('category_id'))
    quantity = int(request.form.get('quantity'))
    image_url = ''

    if 'image' in request.files:
        image = request.files['image']
        if image:
            # filename = secure_filename(image.filename)
            filename = str(name.strip().replace(" ", "-")) + ".png"
            
            # Saving the image
            image.save('data/' + current_app.config['UPLOAD_FOLDER'] + filename)
            image_url = "media/uploads/" + filename
    else:
        image_url = 'static/images/no_preview.png'

    for product in MenuItem.query.filter_by(is_active=False).all():
        if product.name == name:
            product.price = price
            product.category_id = category_id
            product.is_active = True
            product.image_url = image_url
            product.quantity = quantity
            product.created_on = datetime.now()
            db.session.commit()
            return jsonify(product.to_dict()), 201
    else:        
        new_product = MenuItem(
            name=name,
            price=price,
            category_id=category_id,
            quantity=quantity,
            image_url=image_url
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.to_dict()), 201

@products.route('/products/edit/<int:id>', methods=['POST'])
def edit_product(id):
    product = MenuItem.query.get_or_404(id)

    product.name = request.form.get('name')
    product.price = float(request.form.get('price'))
    product.category_id = int(request.form.get('category_id'))
    product.quantity = int(request.form.get('quantity'))
    image_url = ''

    if 'image' in request.files:
        image = request.files['image']
        if image:
            # filename = secure_filename(image.filename)
            filename = str(product.name.strip().replace(" ", "-")) + ".png"
            
            # Saving the image
            image.save('data/' + current_app.config['UPLOAD_FOLDER'] + filename)
            image_url = "media/uploads/" + filename
    
    product.image_url = image_url
    db.session.commit()

    return jsonify(product.to_dict())

@products.route('/products/delete/<int:id>', methods=['POST'])
def delete_product(id):
    item = MenuItem.query.get_or_404(id)
    
    # Soft delete
    item.is_active = False
    db.session.commit()

    return jsonify(item.to_dict())

# @products.route('/api/inventory/<int:id>', methods=['PUT'])
# def update_inventory(id):
#     item = MenuItem.query.get_or_404(id)
#     data = request.get_json()
    
#     if 'quantity' in data:
#         item.quantity = data['quantity']
    
#     db.session.commit()
#     return jsonify(item.to_dict())
