// Video Downloader JavaScript functionality
class VideoDownloader {
    constructor() {
        this.currentDownloadId = null;
        this.progressInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // URL form submission
        document.getElementById('url-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeVideo();
        });

        // Format selection change
        document.getElementById('format-select').addEventListener('change', (e) => {
            const downloadBtn = document.getElementById('download-btn');
            downloadBtn.disabled = !e.target.value;
        });

        // Download button click
        document.getElementById('download-btn').addEventListener('click', () => {
            this.startDownload();
        });
    }

    showLoading(show = true) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        document.getElementById('analyze-btn').disabled = show;
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

    showVideoInfo(videoData) {
        this.hideError();
        
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

        // Populate format options
        this.populateFormats(videoData.formats);

        // Show video info section
        document.getElementById('video-info').style.display = 'block';
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

    async analyzeVideo() {
        const url = document.getElementById('video-url').value.trim();
        
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading(true);
        this.hideVideoInfo();

        try {
            const response = await fetch('/get_video_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze video');
            }

            this.showVideoInfo(data);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async startDownload() {
        const url = document.getElementById('video-url').value.trim();
        const formatSelect = document.getElementById('format-select');
        const formatId = formatSelect.value;
        const audioOnly = formatSelect.selectedOptions[0]?.dataset.audioOnly === 'true';

        if (!formatId) {
            this.showError('Please select a format');
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
                    format_id: formatId,
                    audio_only: audioOnly
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
    new VideoDownloader();
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
