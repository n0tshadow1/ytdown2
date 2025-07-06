import os
import logging
from flask import Flask, render_template, request, jsonify
from video_downloader_vercel import VideoDownloader

# Configure logging for Vercel
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-vercel")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_video_info', methods=['POST'])
def get_video_info():
    try:
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        url = request.json.get('url', '').strip() if request.json else ''
        if not url:
            return jsonify({'error': 'Please provide a valid URL'}), 400
        
        logging.info(f"Analyzing URL: {url}")
        
        downloader = VideoDownloader()
        video_info = downloader.get_video_info(url)
        
        if 'error' in video_info:
            logging.error(f"Video info error: {video_info['error']}")
            return jsonify(video_info), 400
        
        logging.info(f"Video info retrieved successfully")
        return jsonify(video_info)
    
    except Exception as e:
        logging.error(f"Error getting video info: {str(e)}")
        return jsonify({'error': f'Failed to get video information: {str(e)}'}), 500

@app.route('/download_video', methods=['POST'])
def download_video():
    try:
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        url = request.json.get('url', '').strip()
        quality = request.json.get('quality', '480p')
        file_format = request.json.get('format', 'mp4')
        
        if not url:
            return jsonify({'error': 'Please provide a valid URL'}), 400
        
        logging.info(f"Starting download: {url}, Quality: {quality}, Format: {file_format}")
        
        downloader = VideoDownloader()
        
        # Simplified download for serverless environment
        try:
            result = downloader.download_video(url, format_id=None, audio_only=(file_format == 'mp3'))
            if result and 'filepath' in result:
                return jsonify({
                    'success': True,
                    'message': 'Download completed successfully',
                    'filename': os.path.basename(result['filepath'])
                })
            else:
                return jsonify({'error': 'Download failed'}), 500
                
        except Exception as download_error:
            logging.error(f"Download error: {str(download_error)}")
            return jsonify({'error': f'Download failed: {str(download_error)}'}), 500
    
    except Exception as e:
        logging.error(f"Error in download endpoint: {str(e)}")
        return jsonify({'error': f'Failed to process download: {str(e)}'}), 500

# Health check endpoint for Vercel
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ytdown'})

# For Vercel deployment
app.wsgi_app = app.wsgi_app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)