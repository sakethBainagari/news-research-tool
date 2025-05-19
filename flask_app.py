# This file is needed for PythonAnywhere deployment
from flask import Flask, send_from_directory, jsonify
from api import app as api_app
import logging
import os

# Configure minimal logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Initialize Flask app with minimal settings
app = Flask(__name__, 
    static_folder='.',
    static_url_path='',
    template_folder='.'
)

# Disable unnecessary features
app.config['JSON_SORT_KEYS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True

# Mount the API routes under /api
app.register_blueprint(api_app, url_prefix='/api')

# Basic error handler
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500

# Serve static files with caching
@app.route('/')
def serve_index():
    try:
        response = send_from_directory('.', 'index.html')
        response.headers['Cache-Control'] = 'public, max-age=300'  # Cache for 5 minutes
        return response
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>')
def serve_static(path):
    try:
        response = send_from_directory('.', path)
        response.headers['Cache-Control'] = 'public, max-age=300'  # Cache for 5 minutes
        return response
    except Exception as e:
        logger.error(f"Error serving static file {path}: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Quick health check endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

# This allows running the file directly for testing
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 