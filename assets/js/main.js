// YTdown Video Downloader JavaScript functionality
class VideoDownloader {
    constructor() {
        this.selectedFormat = null;
        this.selectedQuality = null;
        this.selectedFileFormat = null;
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('YTdown VideoDownloader initialized successfully');
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

        // Format selection with debugging
        document.addEventListener('click', (e) => {
            const formatOption = e.target.closest('.format-option');
            const qualityOption = e.target.closest('.quality-option');
            
            if (formatOption) {
                console.log('Format option clicked:', formatOption);
                this.handleFormatSelection(formatOption);
            }
            if (qualityOption && !formatOption) {
                console.log('Quality option clicked:', qualityOption);
                this.handleQualitySelection(qualityOption);
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
        this.hideDownloadOptions();
    }

    hideError() {
        document.getElementById('error-display').style.display = 'none';
    }

    handleFormatSelection(element) {
        console.log('Handling format selection for:', element);
        console.log('Element dataset:', element.dataset);
        
        // Remove active class from all format options
        document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedFormat = element.dataset.format;
        console.log('Selected format:', this.selectedFormat);
        
        // Show quality section
        this.showQualityOptions();
        
        // Reset quality and file format selections
        this.selectedQuality = null;
        this.selectedFileFormat = null;
        document.getElementById('download-btn').disabled = true;
    }
    
    handleQualitySelection(element) {
        console.log('Handling quality selection for:', element);
        console.log('Quality dataset:', element.dataset);
        
        // Remove active class from all quality options
        document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedQuality = element.dataset.quality;
        console.log('Selected quality:', this.selectedQuality);
        
        // Show file format section
        this.showFileFormatOptions();
    }
    
    handleFileFormatSelection(element) {
        console.log('Handling file format selection for:', element);
        console.log('File format dataset:', element.dataset);
        
        // Remove active class from all file format options
        document.querySelectorAll('.file-format-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add active class to selected option
        element.classList.add('selected');
        
        this.selectedFileFormat = element.dataset.format;
        console.log('Selected file format:', this.selectedFileFormat);
        
        // Enable download button
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = false;
        console.log('Download button enabled, current selections:', {
            format: this.selectedFormat,
            quality: this.selectedQuality,
            fileFormat: this.selectedFileFormat
        });
    }

    showDownloadOptions() {
        this.hideError();
        
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

        // Show download options section
        document.getElementById('download-options').style.display = 'block';
        console.log('Download options should now be visible');
    }
    
    hideDownloadOptions() {
        document.getElementById('download-options').style.display = 'none';
    }
    
    showQualityOptions() {
        console.log('Showing quality options for format:', this.selectedFormat);
        const qualitySection = document.getElementById('quality-section');
        const qualityOptions = document.getElementById('quality-options');
        
        if (!qualitySection || !qualityOptions) {
            console.error('Quality section elements not found');
            return;
        }
        
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

    async analyzeVideo(url) {
        if (!url) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading(true);
        this.hideDownloadOptions();
        this.hideError();

        try {
            // For demo purposes, show download options immediately
            // In a real implementation, this would call a backend API
            setTimeout(() => {
                this.showLoading(false);
                this.showDownloadOptions();
            }, 2000);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze video. Please check the URL and try again.');
            this.showLoading(false);
        }
    }

    async startDownload() {
        console.log('Starting download with selections:', {
            format: this.selectedFormat,
            quality: this.selectedQuality,
            fileFormat: this.selectedFileFormat
        });

        // More lenient validation - check if basic selections are made
        if (!this.selectedFormat) {
            this.showError('Please select a format (Video or Audio)');
            return;
        }

        if (!this.selectedQuality) {
            this.showError('Please select a quality option');
            return;
        }

        if (!this.selectedFileFormat) {
            this.showError('Please select a file format');
            return;
        }

        // Get the current video URL from the active tab
        const activeForm = document.querySelector('.tab-pane.active .url-form');
        const url = activeForm.querySelector('.video-url').value.trim();

        if (!url) {
            this.showError('Please enter a video URL');
            return;
        }

        console.log('All validations passed, starting download...');
        
        // For demo purposes, show success message
        this.showError('Demo mode: Download would start with ' + this.selectedQuality + ' quality in ' + this.selectedFileFormat + ' format. Real implementation requires server-side processing.');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new VideoDownloader();
    } catch (error) {
        console.error('Error initializing VideoDownloader:', error);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});