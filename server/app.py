"""
Server-side API for invoice template processing
Handles DOCX parsing, variable extraction, and PDF generation using LibreOffice
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from app.routes import upload, generate
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Proper CORS configuration for file uploads
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"]
)

# Ensure CORS headers are always present
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

# Create uploads folder if not exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register routes
app.register_blueprint(upload.bp)
app.register_blueprint(generate.bp)

@app.route('/', methods=['GET'])
def index():
    """API root endpoint with documentation"""
    return jsonify({
        'service': 'Invoice Automation Server',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': {
                'path': '/health',
                'method': 'GET',
                'description': 'Health check endpoint'
            },
            'upload': {
                'path': '/upload',
                'method': 'POST',
                'description': 'Upload DOCX/PDF template and extract variables'
            },
            'generate': {
                'path': '/generate',
                'method': 'POST',
                'description': 'Generate PDF from template with variables filled'
            }
        },
        'documentation': 'https://github.com/kiwabc123/document-text-replacing'
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'invoice-server'}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting Invoice Automation Server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
