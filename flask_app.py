# This file is needed for PythonAnywhere deployment
from flask import Flask, send_from_directory, jsonify, send_file
from api import app as api_blueprint  # Rename for clarity
import logging
import os
import mimetypes
from flask_cors import CORS  # Add this import

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Add proper MIME types
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/html', '.html')

# Initialize Flask app
app = Flask(__name__, 
    static_folder='.',
    static_url_path='',
    template_folder='.'
)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Debug configuration
app.config['DEBUG'] = True
app.config['JSON_SORT_KEYS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True

# Mount the API routes under /api
logger.info("Registering API Blueprint...")
app.register_blueprint(api_blueprint, url_prefix='/api')
logger.info("API Blueprint registered successfully")

# List all registered routes for debugging
@app.before_first_request
def log_routes():
    logger.info("Registered Routes:")
    for rule in app.url_map.iter_rules():
        logger.info(f"{rule.endpoint}: {rule.rule}")

# Basic error handler
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "message": str(error),
        "type": str(type(error).__name__)
    }), 500

# Serve static files with proper MIME types and caching
@app.route('/')
def serve_index():
    try:
        logger.info("Serving index.html")
        response = send_file('index.html', mimetype='text/html')
        response.headers['Cache-Control'] = 'public, max-age=300'
        return response
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>')
def serve_static(path):
    try:
        logger.info(f"Serving static file: {path}")
        mime_type = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        response = send_file(path, mimetype=mime_type)
        response.headers['Cache-Control'] = 'public, max-age=300'
        
        # Add CORS headers for style and script files
        if path.endswith(('.css', '.js')):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
    except Exception as e:
        logger.error(f"Error serving static file {path}: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "routes": [str(rule.rule) for rule in app.url_map.iter_rules()]
    }), 200

# This allows running the file directly for testing
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 