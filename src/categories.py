from flask import Blueprint,  request, jsonify

from src.models import db, Category

categories = Blueprint('categories', __name__, template_folder='templates')

@categories.route('/categories/fetch', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify([category.to_dict() for category in categories])        

@categories.route('/categories/add', methods=['POST'])
def add_category():
    data = request.get_json()
    for category in Category.query.filter_by(is_active=False).all():
        if category.name == data['name']:
            category.is_active = True
            db.session.commit()
            return jsonify(category.to_dict()), 201
    else:
        new_category = Category(name=data['name'])
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.to_dict()), 201


@categories.route('/categories/edit/<int:id>', methods=['POST'])
def edit_category(id):
    data = request.get_json()
    category = Category.query.get_or_404(id)

    category.name = data['name']
    db.session.commit()

    return jsonify(category.to_dict()), 201

@categories.route('/categories/delete/<int:id>', methods=['POST'])
def delete_category(id):
    category = Category.query.get_or_404(id)

    # Soft delete
    category.is_active = False
    db.session.commit()
    return jsonify(category.to_dict())
