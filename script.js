document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchTermInput = document.getElementById('search-term');
    const resultsDiv = document.getElementById('results');
    const lyricsDisplayDiv = document.getElementById('lyrics-display');
    lyricsDisplayDiv.style.display = 'none'; // Initially hide the lyrics display div
    const h1 = document.querySelector('h1'); // Get the h1 element
    const previewPanel = document.createElement('div'); // Create preview panel dynamically
    previewPanel.id = 'preview-panel';
    previewPanel.className = 'preview-panel';
    previewPanel.style.display = 'none'; // Initially hide preview panel
	previewPanel.innerHTML = `
        <div class="preview-content">
			<div class="preview-lyrics-header">
				<div class="preview-lyrics-header-lyrics">	
					<button id="preview-plain-lyrics-button" class="preview-lyrics-type-button active">Plain</button>
					<button id="preview-synced-lyrics-button" class="preview-lyrics-type-button">Synced</button>
				</div>
				<div class="preview-lyrics-header-button">
					<button id="preview-close-button">X</button>
				</div>
            </div>
			<div class="preview-lyrics-text">
				<pre id="preview-plain-lyrics-text" class="preview-lyrics-text"></pre>
				<pre id="preview-synced-lyrics-text" class="preview-lyrics-text" style="display: none;"></pre>
            </div>
        </div>
    `;
    document.body.appendChild(previewPanel); // Append preview panel to body

    const previewPlainLyricsTextElement = previewPanel.querySelector('#preview-plain-lyrics-text');
    const previewSyncedLyricsTextElement = previewPanel.querySelector('#preview-synced-lyrics-text');
    const previewCloseButton = previewPanel.querySelector('#preview-close-button');
    const previewPlainLyricsButton = previewPanel.querySelector('#preview-plain-lyrics-button');
    const previewSyncedLyricsButton = previewPanel.querySelector('#preview-synced-lyrics-button');


    previewCloseButton.addEventListener('click', () => {
        previewPanel.style.display = 'none'; // Hide the preview panel
    });

    previewPlainLyricsButton.addEventListener('click', () => {
        previewPlainLyricsTextElement.style.display = 'block';
        previewSyncedLyricsTextElement.style.display = 'none';
        previewPlainLyricsButton.classList.add('active');
        previewSyncedLyricsButton.classList.remove('active');
    });

    previewSyncedLyricsButton.addEventListener('click', () => {
        previewPlainLyricsTextElement.style.display = 'none';
        previewSyncedLyricsTextElement.style.display = 'block';
        previewSyncedLyricsButton.classList.add('active');
        previewPlainLyricsButton.classList.remove('active');
    });


    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const searchTerm = searchTermInput.value;
        resultsDiv.innerHTML = "";
        lyricsDisplayDiv.innerHTML = "";

        const apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchTerm)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    data.forEach(item => {
                        const lyricItem = document.createElement('div');
                        lyricItem.className = 'lyric-item';
                        lyricItem.innerHTML = `
							<div class="track-details">
								<div class="track-title">${item.trackName}</div>
								<div class="track-info">
									<span class="duration">${formatDuration(item.duration)}</span>
									<span id="${item.syncedLyrics ? 'Synced' : 'Plain'}">${item.syncedLyrics ? 'Synced' : 'Plain'}</span>
								</div>
								<div class="album-info">${item.albumName ? item.albumName + ' - ' : ''}${item.artistName}</div>
							</div>
							<div class="preview-button">Preview</div>`; // Added Preview Button
							
                        const previewButton = lyricItem.querySelector('.preview-button');
                        previewButton.addEventListener('click', (event) => {
                            event.stopPropagation(); // Prevent lyric item click event
                            showPreview(item);
                        });
                        lyricItem.addEventListener('click', () => displayLyrics(item));
                        resultsDiv.appendChild(lyricItem);
                    });
                    lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on results
                } else {
                    resultsDiv.innerHTML = "<p>No lyrics found.</p>";
                    lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display if no results
                }
            })
            .catch(error => {
                console.error("Error fetching lyrics:", error);
                resultsDiv.innerHTML = "<p>Error fetching lyrics.</p>";
                lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on error
            });

        // Push state for history
        history.pushState({ searchTerm: searchTerm }, "", `?q=${searchTerm}`);
    });

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.searchTerm) {
            const searchTerm = event.state.searchTerm;
            searchTermInput.value = searchTerm;
            searchLyrics();
            lyricsDisplayDiv.style.display = 'none'; // Keep lyrics display hidden, results will be shown
        } else {
            // Handle initial state (no search)
            searchTermInput.value = "";
            resultsDiv.innerHTML = "";
            lyricsDisplayDiv.innerHTML = "";
            lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on initial state
        }
    });

    h1.addEventListener('click', () => {
        history.pushState(null, "", window.location.pathname); // Go to base URL
        searchTermInput.value = "";
        resultsDiv.innerHTML = "";
        lyricsDisplayDiv.innerHTML = "";
        lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on h1 click
        previewPanel.style.display = 'none'; // Ensure preview panel is also hidden
    });

    function displayLyrics(lyricData) {
        lyricsDisplayDiv.style.display = 'none'; // Show lyrics display when lyrics are displayed
        lyricsDisplayDiv.innerHTML = lyricData.plainLyrics || lyricData.syncedLyrics || "No lyrics available";

        let lrcContent = "";
        if (lyricData.syncedLyrics) {
            lrcContent = lyricData.syncedLyrics;
        } else {
            lrcContent = lyricData.plainLyrics;
        }

        const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${lyricData.trackName} - ${lyricData.artistName}.lrc`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function searchLyrics() {
        const searchTerm = searchTermInput.value;
        resultsDiv.innerHTML = "";
        lyricsDisplayDiv.innerHTML = "";

        const apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchTerm)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    data.forEach(item => {
                        const lyricItem = document.createElement('div');
                        lyricItem.className = 'lyric-item';
                        lyricItem.innerHTML = `
                            <div class="track-title">${item.trackName}</div>
                            <div class="track-info">
                                <span class="duration">${formatDuration(item.duration)}</span>
                                <span id="${item.syncedLyrics ? 'Synced' : 'Plain'}">${item.syncedLyrics ? 'Synced' : 'Plain'}</span>
                            </div>
                            <div class="album-info">${item.albumName ? item.albumName + ' - ' : ''}${item.artistName}</div>
                            <span class="preview-button">Preview Lyrics</span>`; // Added Preview Button

                        const previewButton = lyricItem.querySelector('.preview-button');
                        previewButton.addEventListener('click', (event) => {
                            event.stopPropagation(); // Prevent lyric item click event
                            showPreview(item);
                        });
                        lyricItem.addEventListener('click', () => displayLyrics(item));
                        resultsDiv.appendChild(lyricItem);
                    });
                    lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on results
                } else {
                    resultsDiv.innerHTML = "<p>No lyrics found.</p>";
                    lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display if no results
                }
            })
            .catch(error => {
                console.error("Error fetching lyrics:", error);
                resultsDiv.innerHTML = "<p>Error fetching lyrics.</p>";
                lyricsDisplayDiv.style.display = 'none'; // Hide lyrics display on error
            });
    }

    function showPreview(lyricData) {
        previewPlainLyricsButton.classList.add('active');
        previewSyncedLyricsButton.classList.remove('active');
        previewPlainLyricsTextElement.style.display = 'block';
        previewSyncedLyricsTextElement.style.display = 'none';


        if (lyricData.plainLyrics && lyricData.syncedLyrics) {
            previewPlainLyricsTextElement.textContent = lyricData.plainLyrics || "Plain lyrics not available";
            previewSyncedLyricsTextElement.textContent = lyricData.syncedLyrics || "Synced lyrics not available";
            previewPlainLyricsButton.style.display = 'inline-block'; // Show buttons
            previewSyncedLyricsButton.style.display = 'inline-block';
        } else if (lyricData.syncedLyrics) {
            previewSyncedLyricsTextElement.textContent = lyricData.syncedLyrics;
            previewPlainLyricsTextElement.textContent = "";
            previewSyncedLyricsButton.classList.add('active');
            previewPlainLyricsButton.classList.remove('active');
            previewPlainLyricsTextElement.style.display = 'none';
            previewSyncedLyricsTextElement.style.display = 'block';
            previewPlainLyricsButton.style.display = 'none'; // Hide Plain button
            previewSyncedLyricsButton.style.display = 'inline-block';
        }
        else {
             previewPlainLyricsTextElement.textContent = lyricData.plainLyrics || "No lyrics available";
             previewSyncedLyricsTextElement.textContent = "";
             previewPlainLyricsButton.style.display = 'none'; // Hide buttons if only plain lyrics or no lyrics
             previewSyncedLyricsButton.style.display = 'none';
        }


        previewPanel.style.display = 'block'; // Show the preview panel
    }


    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

        if (hours > 0) {
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
            return `${formattedMinutes}:${formattedSeconds}`;
        }
    }
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) { // ESC key
        if (previewPanel.style.display === 'block') {
            previewPanel.style.display = 'none'; // Hide the preview panel
        }
    }
});

// Add this event listener to close preview panel when clicking outside preview-content
const previewContent = previewPanel.querySelector('.preview-content'); // Get the preview content element
document.addEventListener('click', (event) => {
	if (previewPanel.style.display === 'block' && !previewContent.contains(event.target)) {
		previewPanel.style.display = 'none'; // Hide the preview panel
		}
});

// Handle initial URL parameter
const urlParams = new URLSearchParams(window.location.search);
const initialSearchTerm = urlParams.get('q');
if (initialSearchTerm) {
    searchTermInput.value = initialSearchTerm;
    searchForm.dispatchEvent(new Event('submit'));
}

});
