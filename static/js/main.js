// Enhanced Video Downloader JavaScript functionality
class VideoDownloader {
    constructor() {
        this.currentDownloadId = null;
        this.progressInterval = null;
        this.selectedFormat = null;
        this.selectedQuality = null;
        this.selectedFileFormat = null;
        this.videoData = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Platform-specific URL form submissions
        document.querySelectorAll('.url-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('.video-url');
                this.analyzeVideo(input.value.trim());
            });
        });

        // Format selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.format-option')) {
                this.handleFormatSelection(e.target.closest('.format-option'));
            }
            if (e.target.closest('.quality-option')) {
                this.handleQualitySelection(e.target.closest('.quality-option'));
            }
        });

        // Download button click
        document.getElementById('download-btn').addEventListener('click', () => {
            this.startDownload();
        });
    }

    showLoading(show = true) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        // Disable all analyze buttons
        document.querySelectorAll('.analyze-btn').forEach(btn => {
            btn.disabled = show;
        });
    }

    showError(message) {
        const errorDiv = document.getElementById('error-display');
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorDiv.style.display = 'block';
        this.hideVideoInfo();
    }

    hideError() {
        document.getElementById('error-display').style.display = 'none';
    }

    handleFormatSelection(element) {
        // Remove active class from all format options
        document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedFormat = element.dataset.format;
        
        // Show quality section
        this.showQualityOptions();
        
        // Reset quality and file format selections
        this.selectedQuality = null;
        this.selectedFileFormat = null;
        document.getElementById('download-btn').disabled = true;
    }
    
    handleQualitySelection(element) {
        // Remove active class from all quality options
        document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedQuality = element.dataset.quality;
        
        // Show file format section
        this.showFileFormatOptions();
    }
    
    handleFileFormatSelection(element) {
        // Remove active class from all file format options
        document.querySelectorAll('.file-format-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedFileFormat = element.dataset.format;
        
        // Enable download button
        document.getElementById('download-btn').disabled = false;
    }

    showVideoInfo(videoData) {
        console.log('Showing video info:', videoData);
        this.hideError();
        this.videoData = videoData;
        
        // Update video information
        document.getElementById('video-title').textContent = videoData.title;
        document.getElementById('video-uploader').textContent = videoData.uploader || 'Unknown';
        document.getElementById('video-duration').textContent = this.formatDuration(videoData.duration);
        document.getElementById('video-views').textContent = this.formatNumber(videoData.view_count);
        
        // Update thumbnail
        const thumbnail = document.getElementById('video-thumbnail');
        if (videoData.thumbnail) {
            thumbnail.src = videoData.thumbnail;
            thumbnail.style.display = 'block';
        } else {
            thumbnail.style.display = 'none';
        }

        // Reset selections
        this.selectedFormat = null;
        this.selectedQuality = null;
        this.selectedFileFormat = null;
        
        // Reset format options visual state
        document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
        
        // Hide quality and file format sections initially
        document.getElementById('quality-section').style.display = 'none';
        document.getElementById('file-format-section').style.display = 'none';
        document.getElementById('download-btn').disabled = true;

        // Show video info section
        document.getElementById('video-info').style.display = 'block';
        console.log('Video info section should now be visible');
    }
    
    showQualityOptions() {
        const qualitySection = document.getElementById('quality-section');
        const qualityOptions = document.getElementById('quality-options');
        
        qualityOptions.innerHTML = '';
        
        if (this.selectedFormat === 'video') {
            // Video quality options
            const videoQualities = [
                { quality: '2160', label: '4K (2160p)', formatId: 'best[height<=2160]' },
                { quality: '1440', label: '2K (1440p)', formatId: 'best[height<=1440]' },
                { quality: '1080', label: 'Full HD (1080p)', formatId: 'best[height<=1080]' },
                { quality: '720', label: 'HD (720p)', formatId: 'best[height<=720]' },
                { quality: '480', label: 'SD (480p)', formatId: 'best[height<=480]' },
                { quality: '360', label: 'Low (360p)', formatId: 'best[height<=360]' },
                { quality: '240', label: 'Very Low (240p)', formatId: 'best[height<=240]' },
                { quality: '144', label: 'Mobile (144p)', formatId: 'best[height<=144]' }
            ];
            
            videoQualities.forEach(quality => {
                const option = document.createElement('div');
                option.className = 'quality-option';
                option.dataset.quality = quality.formatId;
                option.textContent = quality.label;
                option.addEventListener('click', () => this.handleQualitySelection(option));
                qualityOptions.appendChild(option);
            });
        } else if (this.selectedFormat === 'audio') {
            // Audio quality options
            const audioQualities = [
                { quality: 'bestaudio', label: 'Best Quality', formatId: 'bestaudio' },
                { quality: '320', label: '320 kbps', formatId: 'bestaudio[abr<=320]' },
                { quality: '256', label: '256 kbps', formatId: 'bestaudio[abr<=256]' },
                { quality: '192', label: '192 kbps', formatId: 'bestaudio[abr<=192]' },
                { quality: '128', label: '128 kbps', formatId: 'bestaudio[abr<=128]' },
                { quality: '96', label: '96 kbps', formatId: 'bestaudio[abr<=96]' }
            ];
            
            audioQualities.forEach(quality => {
                const option = document.createElement('div');
                option.className = 'quality-option';
                option.dataset.quality = quality.formatId;
                option.textContent = quality.label;
                option.addEventListener('click', () => this.handleQualitySelection(option));
                qualityOptions.appendChild(option);
            });
        }
        
        qualitySection.style.display = 'block';
    }
    
    showFileFormatOptions() {
        const fileFormatSection = document.getElementById('file-format-section');
        const fileFormatOptions = document.getElementById('file-format-options');
        
        fileFormatOptions.innerHTML = '';
        
        if (this.selectedFormat === 'video') {
            // Video file formats
            const videoFormats = [
                { format: 'mp4', label: 'MP4', desc: 'Most compatible' },
                { format: 'webm', label: 'WebM', desc: 'High quality' },
                { format: 'mkv', label: 'MKV', desc: 'Best quality' },
                { format: '3gp', label: '3GP', desc: 'Mobile friendly' },
                { format: 'avi', label: 'AVI', desc: 'Classic format' }
            ];
            
            videoFormats.forEach(format => {
                const option = document.createElement('div');
                option.className = 'quality-option file-format-option';
                option.dataset.format = format.format;
                option.innerHTML = `<strong>${format.label}</strong><br><small>${format.desc}</small>`;
                option.addEventListener('click', () => this.handleFileFormatSelection(option));
                fileFormatOptions.appendChild(option);
            });
        } else if (this.selectedFormat === 'audio') {
            // Audio file formats
            const audioFormats = [
                { format: 'mp3', label: 'MP3', desc: 'Most compatible' },
                { format: 'm4a', label: 'M4A', desc: 'High quality' },
                { format: 'ogg', label: 'OGG', desc: 'Open source' },
                { format: 'wav', label: 'WAV', desc: 'Uncompressed' },
                { format: 'flac', label: 'FLAC', desc: 'Lossless' }
            ];
            
            audioFormats.forEach(format => {
                const option = document.createElement('div');
                option.className = 'quality-option file-format-option';
                option.dataset.format = format.format;
                option.innerHTML = `<strong>${format.label}</strong><br><small>${format.desc}</small>`;
                option.addEventListener('click', () => this.handleFileFormatSelection(option));
                fileFormatOptions.appendChild(option);
            });
        }
        
        fileFormatSection.style.display = 'block';
    }

    hideVideoInfo() {
        document.getElementById('video-info').style.display = 'none';
        this.hideDownloadProgress();
    }

    populateFormats(formats) {
        const formatSelect = document.getElementById('format-select');
        formatSelect.innerHTML = '<option value="">Select format and quality...</option>';

        // Group formats by type
        const videoFormats = formats.filter(f => f.type === 'video');
        const audioFormats = formats.filter(f => f.type === 'audio');

        // Add video formats
        if (videoFormats.length > 0) {
            const videoGroup = document.createElement('optgroup');
            videoGroup.label = 'Video Formats';
            
            videoFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format.format_id;
                option.textContent = `${format.resolution} - ${format.ext.toUpperCase()}${format.filesize ? ` (${this.formatFileSize(format.filesize)})` : ''}`;
                videoGroup.appendChild(option);
            });
            
            formatSelect.appendChild(videoGroup);
        }

        // Add audio formats
        if (audioFormats.length > 0) {
            const audioGroup = document.createElement('optgroup');
            audioGroup.label = 'Audio Only';
            
            audioFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format.format_id;
                option.dataset.audioOnly = 'true';
                option.textContent = `${format.resolution} - ${format.ext.toUpperCase()}${format.filesize ? ` (${this.formatFileSize(format.filesize)})` : ''}`;
                audioGroup.appendChild(option);
            });
            
            formatSelect.appendChild(audioGroup);
        }

        // Reset download button
        document.getElementById('download-btn').disabled = true;
    }

    showDownloadProgress() {
        document.getElementById('download-progress').style.display = 'block';
        document.getElementById('download-complete').style.display = 'none';
        this.updateProgress(0, 'Preparing download...');
    }

    hideDownloadProgress() {
        document.getElementById('download-progress').style.display = 'none';
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    updateProgress(percent, status) {
        const progressBar = document.getElementById('progress-bar');
        const statusElement = document.getElementById('download-status');
        
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${Math.round(percent)}%`;
        statusElement.textContent = status;

        if (percent >= 100) {
            progressBar.classList.remove('progress-bar-animated');
        }
    }

    async analyzeVideo(url) {
        console.log('Analyzing video URL:', url);
        
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading(true);
        this.hideVideoInfo();
        this.hideError();

        try {
            console.log('Sending request to /get_video_info');
            
            const response = await fetch('/get_video_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Video data received:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            this.showVideoInfo(data);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze video. Please check the URL and try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async startDownload() {
        if (!this.selectedFormat || !this.selectedQuality || !this.selectedFileFormat) {
            this.showError('Please select format, quality, and file type');
            return;
        }

        // Get the current video URL from the active tab
        const activeForm = document.querySelector('.tab-pane.active .url-form');
        const url = activeForm.querySelector('.video-url').value.trim();

        if (!url) {
            this.showError('Please enter a video URL');
            return;
        }

        this.showDownloadProgress();

        try {
            const response = await fetch('/download_video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    format_id: this.selectedQuality,
                    audio_only: this.selectedFormat === 'audio',
                    file_format: this.selectedFileFormat
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start download');
            }

            this.currentDownloadId = data.download_id;
            this.trackDownloadProgress();

        } catch (error) {
            this.showError(error.message);
            this.hideDownloadProgress();
        }
    }

    trackDownloadProgress() {
        if (!this.currentDownloadId) return;

        this.progressInterval = setInterval(async () => {
            try {
                const response = await fetch(`/download_progress/${this.currentDownloadId}`);
                const data = await response.json();

                if (data.error) {
                    this.showError(data.error);
                    this.hideDownloadProgress();
                    return;
                }

                if (data.status === 'downloading') {
                    this.updateProgress(data.progress || 0, 'Downloading...');
                } else if (data.status === 'finished' || data.progress >= 100) {
                    this.updateProgress(100, 'Download completed!');
                    this.showDownloadComplete();
                    clearInterval(this.progressInterval);
                } else if (data.status === 'error') {
                    this.showError(data.error || 'Download failed');
                    this.hideDownloadProgress();
                    clearInterval(this.progressInterval);
                }

            } catch (error) {
                console.error('Error tracking progress:', error);
            }
        }, 1000);
    }

    showDownloadComplete() {
        const completeDiv = document.getElementById('download-complete');
        const downloadLink = document.getElementById('download-link');
        
        downloadLink.href = `/download_file/${this.currentDownloadId}`;
        completeDiv.style.display = 'block';
    }

    // Utility functions
    formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    formatNumber(num) {
        if (!num) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatFileSize(bytes) {
        if (!bytes) return '';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new VideoDownloader();
        console.log('VideoDownloader initialized successfully');
    } catch (error) {
        console.error('Error initializing VideoDownloader:', error);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Handle page navigation
window.addEventListener('beforeunload', (e) => {
    // Warn user if download is in progress
    const progressDiv = document.getElementById('download-progress');
    if (progressDiv && progressDiv.style.display !== 'none') {
        e.preventDefault();
        e.returnValue = 'Download in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});
