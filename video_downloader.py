import yt_dlp
import os
import tempfile
import logging
from urllib.parse import urlparse

class VideoDownloader:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
    def get_video_info(self, url):
        """Extract video information without downloading"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Extract relevant information
                video_info = {
                    'title': info.get('title', 'Unknown Title'),
                    'duration': info.get('duration', 0),
                    'thumbnail': info.get('thumbnail', ''),
                    'uploader': info.get('uploader', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'formats': []
                }
                
                # Process available formats
                formats = info.get('formats', [])
                seen_formats = set()
                
                for fmt in formats:
                    if fmt.get('vcodec') and fmt.get('vcodec') != 'none':
                        # Video format
                        format_info = {
                            'format_id': fmt['format_id'],
                            'ext': fmt.get('ext', 'mp4'),
                            'resolution': f"{fmt.get('width', 0)}x{fmt.get('height', 0)}",
                            'filesize': fmt.get('filesize', 0),
                            'type': 'video',
                            'quality': fmt.get('height', 0)
                        }
                        
                        format_key = (format_info['ext'], format_info['resolution'])
                        if format_key not in seen_formats:
                            video_info['formats'].append(format_info)
                            seen_formats.add(format_key)
                    
                    elif fmt.get('acodec') and fmt.get('acodec') != 'none':
                        # Audio format
                        format_info = {
                            'format_id': fmt['format_id'],
                            'ext': fmt.get('ext', 'mp3'),
                            'resolution': 'Audio Only',
                            'filesize': fmt.get('filesize', 0),
                            'type': 'audio',
                            'quality': fmt.get('abr', 0)
                        }
                        
                        format_key = (format_info['ext'], 'audio')
                        if format_key not in seen_formats:
                            video_info['formats'].append(format_info)
                            seen_formats.add(format_key)
                
                # Sort formats by quality
                video_info['formats'].sort(key=lambda x: x['quality'], reverse=True)
                
                # Add common format options if not available
                common_formats = [
                    {'format_id': 'best[height<=2160]', 'ext': 'mp4', 'resolution': '2160p (4K)', 'type': 'video', 'quality': 2160},
                    {'format_id': 'best[height<=1440]', 'ext': 'mp4', 'resolution': '1440p (2K)', 'type': 'video', 'quality': 1440},
                    {'format_id': 'best[height<=1080]', 'ext': 'mp4', 'resolution': '1080p (HD)', 'type': 'video', 'quality': 1080},
                    {'format_id': 'best[height<=720]', 'ext': 'mp4', 'resolution': '720p', 'type': 'video', 'quality': 720},
                    {'format_id': 'best[height<=480]', 'ext': 'mp4', 'resolution': '480p', 'type': 'video', 'quality': 480},
                    {'format_id': 'best[height<=360]', 'ext': 'mp4', 'resolution': '360p', 'type': 'video', 'quality': 360},
                    {'format_id': 'best[height<=240]', 'ext': 'mp4', 'resolution': '240p', 'type': 'video', 'quality': 240},
                    {'format_id': 'best[height<=144]', 'ext': 'mp4', 'resolution': '144p', 'type': 'video', 'quality': 144},
                    {'format_id': 'bestaudio', 'ext': 'mp3', 'resolution': 'Audio Only', 'type': 'audio', 'quality': 320},
                ]
                
                # Add common formats that aren't already present
                existing_keys = {(f['ext'], f['resolution']) for f in video_info['formats']}
                for fmt in common_formats:
                    format_key = (fmt['ext'], fmt['resolution'])
                    if format_key not in existing_keys:
                        video_info['formats'].append(fmt)
                
                return video_info
                
        except Exception as e:
            logging.error(f"Error extracting video info: {str(e)}")
            return {'error': f'Failed to extract video information: {str(e)}'}
    
    def download_video(self, url, format_id=None, audio_only=False, progress_hook=None):
        """Download video with specified format"""
        try:
            # Set download options
            ydl_opts = {
                'outtmpl': os.path.join(self.temp_dir, '%(title)s.%(ext)s'),
                'format': format_id if format_id else 'best',
            }
            
            if progress_hook:
                ydl_opts['progress_hooks'] = [progress_hook]
            
            # Handle audio-only downloads
            if audio_only or (format_id and 'audio' in format_id):
                ydl_opts['format'] = 'bestaudio/best'
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }]
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                # Find the downloaded file
                title = info.get('title', 'download')
                ext = 'mp3' if audio_only else info.get('ext', 'mp4')
                
                # Look for the actual downloaded file
                expected_filename = os.path.join(self.temp_dir, f"{title}.{ext}")
                
                # Sometimes the filename might be slightly different
                if not os.path.exists(expected_filename):
                    # Search for any file in temp directory
                    for file in os.listdir(self.temp_dir):
                        if file.startswith(title[:20]):  # Match first 20 chars of title
                            expected_filename = os.path.join(self.temp_dir, file)
                            break
                
                if os.path.exists(expected_filename):
                    return {
                        'status': 'success',
                        'filename': expected_filename,
                        'title': title,
                        'filesize': os.path.getsize(expected_filename)
                    }
                else:
                    return {'error': 'Downloaded file not found'}
                    
        except Exception as e:
            logging.error(f"Error downloading video: {str(e)}")
            return {'error': f'Failed to download video: {str(e)}'}
