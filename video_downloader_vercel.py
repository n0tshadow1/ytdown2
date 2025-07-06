import yt_dlp
import tempfile
import os
import logging

class VideoDownloader:
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        
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
                
                # Get available formats
                formats = []
                if 'formats' in info and info['formats']:
                    seen_qualities = set()
                    for fmt in info['formats']:
                        if fmt.get('height') and fmt.get('ext') in ['mp4', 'webm']:
                            quality = f"{fmt['height']}p"
                            if quality not in seen_qualities:
                                formats.append({
                                    'quality': quality,
                                    'format_id': fmt['format_id'],
                                    'ext': fmt['ext'],
                                    'filesize': fmt.get('filesize'),
                                })
                                seen_qualities.add(quality)
                
                # Sort formats by quality
                formats.sort(key=lambda x: int(x['quality'].replace('p', '')), reverse=True)
                
                return {
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'thumbnail': info.get('thumbnail', ''),
                    'uploader': info.get('uploader', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'formats': formats[:6],  # Limit to top 6 formats
                }
                
        except Exception as e:
            logging.error(f"Error extracting video info: {str(e)}")
            return {'error': f'Failed to get video information: {str(e)}'}
    
    def download_video(self, url, format_id=None, audio_only=False):
        """Download video - simplified for serverless"""
        try:
            output_path = os.path.join(self.temp_dir, '%(title)s.%(ext)s')
            
            ydl_opts = {
                'outtmpl': output_path,
                'quiet': True,
                'no_warnings': True,
            }
            
            if audio_only:
                ydl_opts['format'] = 'bestaudio/best'
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }]
            elif format_id:
                ydl_opts['format'] = format_id
            else:
                ydl_opts['format'] = 'best[height<=720]'
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info)
                
                return {
                    'filepath': filename,
                    'title': info.get('title', 'Downloaded Video'),
                    'success': True
                }
                
        except Exception as e:
            logging.error(f"Error downloading video: {str(e)}")
            return {'error': f'Download failed: {str(e)}', 'success': False}