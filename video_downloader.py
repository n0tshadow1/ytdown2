import yt_dlp
import os
import tempfile
import logging
from urllib.parse import urlparse

class VideoDownloader:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def _select_best_format(self, available_formats, requested_format_id, audio_only):
        """Select the best available format based on user preference"""
        if not available_formats:
            return 'best'
        
        # If audio only requested
        if audio_only:
            audio_formats = [f for f in available_formats if f and f.get('acodec') and f.get('acodec') != 'none']
            if audio_formats:
                if requested_format_id:
                    # Try to find the requested format
                    for fmt in audio_formats:
                        if fmt.get('format_id') == requested_format_id:
                            return requested_format_id
                # Fallback to best audio
                return 'bestaudio/best'
            return 'best'
        
        # For video downloads
        if requested_format_id:
            # Check if the requested format is available
            for fmt in available_formats:
                if fmt and fmt.get('format_id') == requested_format_id:
                    return requested_format_id
            
            # If requested format is a generic selector (like best[height<=1080])
            # Try to find a suitable alternative
            if 'best[height<=' in requested_format_id:
                try:
                    height = int(requested_format_id.split('<=')[1].split(']')[0])
                    logging.info(f"Looking for formats <= {height}p from {len(available_formats)} total formats")
                    
                    # Debug: Print all formats with heights
                    for fmt in available_formats:
                        if fmt and fmt.get('height'):
                            logging.info(f"Available: {fmt['format_id']} - {fmt['height']}p - {fmt.get('ext')} - vcodec: {fmt.get('vcodec')}")
                    
                    # Find video formats only
                    video_formats = [f for f in available_formats if f and f.get('height') and f.get('vcodec') and f.get('vcodec') != 'none']
                    
                    # Find formats at or below target height
                    suitable_formats = [f for f in video_formats if f.get('height') <= height]
                    
                    logging.info(f"Found {len(suitable_formats)} suitable formats for {height}p from {len(video_formats)} video formats")
                    
                    if suitable_formats:
                        # Sort by quality and return the best one within limit
                        suitable_formats.sort(key=lambda x: x.get('height', 0), reverse=True)
                        selected = suitable_formats[0]
                        logging.info(f"Selected format for {height}p: {selected['format_id']} (actual: {selected['height']}p)")
                        return selected['format_id']
                    else:
                        # If no suitable format found, get the lowest quality available
                        if video_formats:
                            video_formats.sort(key=lambda x: x.get('height', 0))
                            selected = video_formats[0]
                            logging.info(f"No format <= {height}p found, using lowest: {selected['format_id']} (actual: {selected['height']}p)")
                            return selected['format_id']
                except (ValueError, IndexError) as e:
                    logging.error(f"Error parsing format selector: {e}")
                    pass
        
        # Fallback to best available format
        logging.warning(f"No suitable format found for {requested_format_id}, using 'best'")
        return 'best'
        
    def get_video_info(self, url):
        """Extract video information without downloading"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'socket_timeout': 30,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                if not info:
                    return {'error': 'Could not extract video information'}
                
                # Extract relevant information
                video_info = {
                    'title': info.get('title', 'Unknown Title') if info else 'Unknown Title',
                    'duration': info.get('duration', 0) if info else 0,
                    'thumbnail': info.get('thumbnail', '') if info else '',
                    'uploader': info.get('uploader', 'Unknown') if info else 'Unknown',
                    'view_count': info.get('view_count', 0) if info else 0,
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
    

    
    def download_video(self, url, format_id=None, audio_only=False, file_format=None, progress_hook=None):
        """Download video with specified format"""  
        try:
            # First get video info to find available formats
            info_result = self.get_video_info(url)
            if 'error' in info_result:
                return info_result
            
            # Configure format selection based on quality and file format preferences
            if audio_only:
                selected_format = self._select_best_format(info_result.get('formats', []), format_id, True)
            else:
                # For video downloads, select the best matching format
                selected_format = self._select_best_format(info_result.get('formats', []), format_id, False)
                
            logging.info(f"Selected format: {selected_format} for requested: {format_id}")
            
            # If we still have a generic selector, just use 'best'
            if selected_format and 'best[height<=' in selected_format:
                logging.warning(f"Generic selector returned, using 'best' instead of {selected_format}")
                selected_format = 'best'
            
            # Set download options
            ydl_opts = {
                'outtmpl': os.path.join(self.temp_dir, '%(title)s.%(ext)s'),
                'format': selected_format,
            }
            
            if progress_hook:
                ydl_opts['progress_hooks'] = [progress_hook]
            
            # Handle audio-only downloads
            if audio_only:
                if file_format and file_format not in ['mp3', 'm4a']:
                    ydl_opts['postprocessors'] = [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': file_format,
                        'preferredquality': '192' if file_format == 'mp3' else 'best',
                    }]
            else:
                # Handle video downloads with format conversion
                if file_format and file_format != 'mp4':
                    # Configure FFmpeg path explicitly
                    ydl_opts['ffmpeg_location'] = '/nix/store/3zc5jbvqzrn8zmva4fx5p0nh4yy03wk4-ffmpeg-6.1.1-bin/bin/ffmpeg'
                    
                    # Add video converter with proper format conversion
                    if file_format == '3gp':
                        # For 3GP, use most basic conversion that works
                        ydl_opts['postprocessors'] = [{
                            'key': 'FFmpegVideoConvertor',
                            'preferedformat': '3gp',
                        }]
                        # Minimal conversion args for maximum compatibility
                        ydl_opts['postprocessor_args'] = {
                            'ffmpeg': ['-c:v', 'libx264', '-c:a', 'aac', '-f', '3gp']
                        }
                    else:
                        # For other formats, use standard conversion
                        ydl_opts['postprocessors'] = [{
                            'key': 'FFmpegVideoConvertor',
                            'preferedformat': file_format,
                        }]
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                # Find the downloaded file - get all files in temp directory
                title = info.get('title', 'download')
                temp_files = []
                
                try:
                    temp_files = os.listdir(self.temp_dir)
                    logging.info(f"Files in temp directory: {temp_files}")
                except Exception as e:
                    logging.error(f"Error listing temp directory: {e}")
                
                found_file = None
                
                # Look for downloaded files (newest files first)
                if temp_files:
                    # Sort by modification time (newest first)
                    temp_files_with_path = [(f, os.path.join(self.temp_dir, f)) for f in temp_files]
                    temp_files_with_path.sort(key=lambda x: os.path.getmtime(x[1]), reverse=True)
                    
                    # Take the most recently modified file
                    for file_name, file_path in temp_files_with_path:
                        if os.path.isfile(file_path) and file_name.lower().endswith(('.mp4', '.webm', '.mkv', '.avi', '.3gp', '.mp3', '.m4a')):
                            found_file = file_path
                            logging.info(f"Found downloaded file: {found_file}")
                            break
                
                if found_file and os.path.exists(found_file):
                    return {
                        'status': 'success',
                        'filename': found_file,
                        'title': title,
                        'filesize': os.path.getsize(found_file)
                    }
                else:
                    logging.error(f"No suitable file found in temp directory. Available files: {temp_files}")
                    return {'error': f'Downloaded file not found. Available files: {", ".join(temp_files) if temp_files else "none"}'}
                    
        except Exception as e:
            logging.error(f"Error downloading video: {str(e)}")
            return {'error': f'Failed to download video: {str(e)}'}
