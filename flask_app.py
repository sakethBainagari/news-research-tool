# This file is needed for PythonAnywhere deployment
from flask import Flask, send_from_directory
from api import app as api_app

app = Flask(__name__, static_folder='.', static_url_path='')

# Mount the API routes under /api
app.register_blueprint(api_app, url_prefix='/api')

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# This allows running the file directly for testing
if __name__ == '__main__':
    app.run() 