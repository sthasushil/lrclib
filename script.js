document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchTermInput = document.getElementById('search-term');
    const resultsDiv = document.getElementById('results');
    const lyricsDisplayDiv = document.getElementById('lyrics-display');
	lyricsDisplayDiv.style.display = 'none'; // Initially hide the div
    const h1 = document.querySelector('h1'); // Get the h1 element

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
											<div class="track-title">${item.trackName}</div>
											<div class="track-info">
												<span class="duration">${formatDuration(item.duration)}</span>
												<span id="${item.syncedLyrics ? 'Synced' : 'Plain'}">${item.syncedLyrics ? 'Synced' : 'Plain'}</span>
											</div>
											<div class="album-info">${item.albumName ? item.albumName + ' - ' : ''}${item.artistName}</div>`;
                        lyricItem.addEventListener('click', () => displayLyrics(item));
                        resultsDiv.appendChild(lyricItem);
                    });
					lyricsDisplayDiv.style.display = 'none'; // Show on results
                } else {
                    resultsDiv.innerHTML = "<p>No lyrics found.</p>";
					lyricsDisplayDiv.style.display = 'none'; // Hide if no results
                }
            })
            .catch(error => {
                console.error("Error fetching lyrics:", error);
                resultsDiv.innerHTML = "<p>Error fetching lyrics.</p>";
				lyricsDisplayDiv.style.display = 'none'; // Hide on error
            });

        // Push state for history
        history.pushState({ searchTerm: searchTerm }, "", `?q=${searchTerm}`);
    });

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.searchTerm) {
            const searchTerm = event.state.searchTerm;
            searchTermInput.value = searchTerm;
            searchLyrics();
			lyricsDisplayDiv.style.display = 'block'; // Show on popstate if there was a search
        } else {
            // Handle initial state (no search)
            searchTermInput.value = "";
            resultsDiv.innerHTML = "";
            lyricsDisplayDiv.innerHTML = "";
			lyricsDisplayDiv.style.display = 'none'; // Hide on initial state
        }
    });

    h1.addEventListener('click', () => {
        history.pushState(null, "", window.location.pathname); // Go to base URL
        searchTermInput.value = "";
        resultsDiv.innerHTML = "";
        lyricsDisplayDiv.innerHTML = "";
		lyricsDisplayDiv.style.display = 'none'; // Hide on h1 click
    });

    function displayLyrics(lyricData) {
        lyricsDisplayDiv.style.display = 'none'; // Show when lyrics are displayed
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

    // Function to perform the search (re-used by popstate)
    function searchLyrics() {
        const searchTerm = searchTermInput.value;
        resultsDiv.innerHTML = "";
        lyricsDisplayDiv.innerHTML = "";

        const apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchTerm)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // ... (rest of the data handling code is the same)
                 if (data && data.length > 0) {
                    data.forEach(item => {
                        const lyricItem = document.createElement('div');
                        lyricItem.className = 'lyric-item';
                        lyricItem.innerHTML = `${item.trackName} - ${item.artistName} (${item.albumName || 'Unknown Album'}) <span class="${item.syncedLyrics ? 'synced' : 'plain'}">${item.syncedLyrics ? 'Synced' : 'Plain'}</span>`;
                        lyricItem.addEventListener('click', () => displayLyrics(item));
                        resultsDiv.appendChild(lyricItem);
                    });
					lyricsDisplayDiv.style.display = 'none'; // Show on results
                } else {
                    resultsDiv.innerHTML = "<p>No lyrics found.</p>";
					lyricsDisplayDiv.style.display = 'none'; // Hide if no results
                }
            })
            .catch(error => {
                console.error("Error fetching lyrics:", error);
                resultsDiv.innerHTML = "<p>Error fetching lyrics.</p>";
				lyricsDisplayDiv.style.display = 'none'; // Hide on error
            });
    }

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0'); // Pad minutes with 0
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0'); // Pad seconds with 0

    return `${formattedMinutes}:${formattedSeconds}`;
}

});