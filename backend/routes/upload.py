"""
Upload Routes - File upload with Cloudinary integration
"""
from flask import Blueprint, request, jsonify
from mongodb_config import firebase_auth_required
import cloudinary
import cloudinary.uploader
import os

upload_bp = Blueprint('upload', __name__)

# Initialize Cloudinary (if credentials available)
def init_cloudinary(app):
    """Initialize Cloudinary with app config"""
    if (app.config.get('CLOUDINARY_CLOUD_NAME') and 
        app.config.get('CLOUDINARY_API_KEY') and 
        app.config.get('CLOUDINARY_API_SECRET')):
        
        cloudinary.config(
            cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
            api_key=app.config['CLOUDINARY_API_KEY'],
            api_secret=app.config['CLOUDINARY_API_SECRET']
        )
        return True
    return False

@upload_bp.route('/image', methods=['POST'])
@firebase_auth_required
def upload_image():
    """Upload image to Cloudinary or local storage"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Try Cloudinary upload first
        try:
            from flask import current_app
            if init_cloudinary(current_app):
                result = cloudinary.uploader.upload(
                    file,
                    folder="travelsensi",
                    transformation=[
                        {'width': 1200, 'height': 800, 'crop': 'limit'},
                        {'quality': 'auto', 'fetch_format': 'auto'}
                    ]
                )
                
                return jsonify({
                    'success': True,
                    'message': 'Image uploaded successfully',
                    'url': result['secure_url'],
                    'public_id': result['public_id'],
                    'storage': 'cloudinary'
                }), 200
        
        except Exception as cloudinary_error:
            print(f"Cloudinary upload failed: {cloudinary_error}")
        
        # Fallback to local storage
        upload_folder = 'uploads'
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        import uuid
        from werkzeug.utils import secure_filename
        
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        
        file.save(file_path)
        
        # Return relative URL
        file_url = f"/uploads/{unique_filename}"
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'url': file_url,
            'filename': unique_filename,
            'storage': 'local'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/document', methods=['POST'])
# @jwt_required()
def upload_document():
    """Upload document (PDF, DOC, etc.)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'pdf', 'doc', 'docx', 'txt'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Local storage for documents
        upload_folder = 'uploads/documents'
        os.makedirs(upload_folder, exist_ok=True)
        
        import uuid
        from werkzeug.utils import secure_filename
        
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        
        file.save(file_path)
        
        file_url = f"/uploads/documents/{unique_filename}"
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'url': file_url,
            'filename': unique_filename,
            'storage': 'local'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded files (for development)
@upload_bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    from flask import send_from_directory
    return send_from_directory('uploads', filename)