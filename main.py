from datetime import datetime
from werkzeug.utils import secure_filename

from flask import Flask, send_from_directory
from src.models import db, Category, MenuItem, Order, OrderItem
from flaskwebgui import FlaskUI # import FlaskUI

from src.dashboard import dashboard
from src.products import products
from src.categories import categories
from src.checkout import checkout
from src.history import history

# Configs
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'media/uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

app.register_blueprint(dashboard)
app.register_blueprint(products)
app.register_blueprint(categories)
app.register_blueprint(checkout)
app.register_blueprint(history)

db.init_app(app)

# Enabling the Media links
@app.route('/media/uploads/<path:filename>')
def serve_media(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
        # FlaskUI(app=app, server="flask", width=1280, height=600,).run()
        app.run(debug=True, port=5000)
    except Exception as e:
        print(e)
        FlaskUI(app=app, server="flask", width=1280, height=600,).run()