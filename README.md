# YTdown - Video Downloader

A modern, responsive video downloader supporting YouTube, Instagram, Facebook, Twitter, TikTok, and many more platforms.

## Features

- ✅ **Multiple Platforms**: YouTube, Instagram, Facebook, Twitter, TikTok, Vimeo, and 1000+ more
- ✅ **All Resolutions**: 144p to 4K (2160p) support
- ✅ **Multiple Formats**: MP4, WebM, 3GP, AVI, MKV for video; MP3, M4A, OGG, WAV, FLAC for audio
- ✅ **Quality Selection**: Choose exact quality and file format separately
- ✅ **Modern UI**: Dark blue theme with glassmorphism design
- ✅ **Mobile Friendly**: Responsive design for all devices
- ✅ **Platform Tabs**: Dedicated interface for each supported platform

## Installation

### For Python/Flask Version (Replit)

1. The current Flask application is ready to run on Replit
2. All dependencies are configured in `pyproject.toml`
3. Use the "Start application" workflow to run the server

### For PHP Version (InfinityFree Hosting)

1. Upload the following files to your InfinityFree hosting:
   ```
   index.php
   assets/
   ├── css/
   │   └── style.css
   └── js/
       └── main.js
   ```

2. Set your domain to point to the directory containing `index.php`

3. The PHP version is a frontend-only demo that shows the interface

## File Structure

```
YTdown/
├── Python Version (Current)
│   ├── app.py                 # Flask application
│   ├── main.py               # Application entry point
│   ├── video_downloader.py   # yt-dlp wrapper
│   ├── templates/            # HTML templates
│   └── static/              # CSS, JS, assets
│
└── PHP Version (InfinityFree)
    ├── index.php            # Main page
    └── assets/             # CSS, JS assets
```

## Usage

1. **Select Platform**: Choose from YouTube, Instagram, Facebook, Twitter, TikTok, or Other
2. **Enter URL**: Paste the video URL in the platform-specific tab
3. **Analyze**: Click "Analyze" to get video information and format options
4. **Choose Format**: Select Video or Audio format
5. **Select Quality**: Pick resolution (144p to 4K) or audio bitrate
6. **Pick File Format**: Choose MP4, 3GP, WebM, etc. for video or MP3, M4A, etc. for audio
7. **Download**: Click "Download Now" to start the download

## Technical Details

### Python Version
- **Backend**: Flask with yt-dlp
- **Video Processing**: yt-dlp library for extraction and download
- **Frontend**: Bootstrap with custom CSS and vanilla JavaScript
- **Hosting**: Designed for Replit, can be deployed anywhere with Python support

### PHP Version
- **Frontend**: HTML/CSS/JavaScript only
- **Hosting**: Compatible with InfinityFree and other PHP hosting services
- **Note**: PHP version is for demonstration - actual video downloading requires server-side processing

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

### Python Version
- Flask
- yt-dlp
- psycopg2-binary (for database, if needed)
- gunicorn (for production deployment)

### PHP Version
- No server-side dependencies
- Uses CDN for Bootstrap and Font Awesome

## Deployment

### Replit Deployment
1. The application is already configured for Replit
2. Use the built-in workflows to start the server
3. Environment variables are handled automatically

### InfinityFree Deployment
1. Upload the PHP version files via FTP or file manager
2. Ensure `index.php` is in the public folder
3. No additional configuration required

### Other Hosting
- Python version: Any hosting service supporting Python 3.11+ and Flask
- PHP version: Any hosting service supporting basic HTML/CSS/JavaScript

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the console logs in your browser (F12) for debugging information.