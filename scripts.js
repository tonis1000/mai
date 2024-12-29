// Funktion zum Laden einer Playlist und Aktualisieren der Sidebar
async function loadPlaylist(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        updateSidebarFromM3U(data);
    } catch (error) {
        console.error(`Fehler beim Laden der Playlist von ${url}:`, error);
    }
}

// Event-Listener für die Playlist-Buttons
document.getElementById('myPlaylist').addEventListener('click', () => loadPlaylist('playlist.m3u'));
document.getElementById('externalPlaylist').addEventListener('click', () => loadPlaylist('https://raw.githubusercontent.com/gdiolitsis/greek-iptv/refs/heads/master/ForestRock_GR'));
document.getElementById('sportPlaylist').addEventListener('click', () => alert("Funktionalität für Sport-Playlist wird implementiert..."));

// Funktion, um die Ressource abzurufen
async function fetchResource(url) {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    try {
        let response = await fetch(corsProxy + url);
        if (!response.ok) {
            response = await fetch(corsProxy + url.replace('http:', 'https:'));
        }
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.text();
        updateSidebarFromM3U(data);
    } catch (error) {
        console.error('Fehler beim Laden der Playlist mit CORS-Proxy:', error);
        try {
            let response = await fetch(url);
            if (!response.ok) {
                response = await fetch(url.replace('http:', 'https:'));
            }
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.text();
            updateSidebarFromM3U(data);
        } catch (error) {
            console.error('Fehler beim Laden der Playlist ohne CORS-Proxy:', error);
        }
    }
}

// Event-Listener für den Playlist-Button
document.getElementById('playlist-button').addEventListener('click', () => {
    const playlistURL = document.getElementById('stream-url').value;
    if (playlistURL) {
        fetchResource(playlistURL);
    }
});

// Leeren Button
document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('stream-url').value = '';
});

// Kopieren Button
document.getElementById('copy-button').addEventListener('click', () => {
    const streamUrlInput = document.getElementById('stream-url');
    streamUrlInput.select();
    document.execCommand('copy');
});

// Globales Objekt für EPG-Daten
let epgData = {};

// Funktion zum Laden und Parsen der EPG-Daten
async function loadEPGData() {
    try {
        const response = await fetch('https://ext.greektv.app/epg/epg.xml');
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const programmes = xmlDoc.getElementsByTagName('programme');
        Array.from(programmes).forEach(prog => {
            const channelId = prog.getAttribute('channel');
            const start = prog.getAttribute('start');
            const stop = prog.getAttribute('stop');
            const titleElement = prog.getElementsByTagName('title')[0];
            const descElement = prog.getElementsByTagName('desc')[0];
            if (titleElement) {
                const title = titleElement.textContent;
                const desc = descElement ? descElement.textContent : 'Keine Beschreibung verfügbar';
                if (!epgData[channelId]) {
                    epgData[channelId] = [];
                }
                epgData[channelId].push({
                    start: parseDateTime(start),
                    stop: parseDateTime(stop),
                    title: title,
                    desc: desc
                });
            }
        });
    } catch (error) {
        console.error('Fehler beim Laden der EPG-Daten:', error);
    }
}

// Hilfsfunktion zum Umwandeln der EPG-Zeitangaben in Date-Objekte
function parseDateTime(epgTime) {
    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1;
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);
    return new Date(Date.UTC(year, month, day, hour - tzHour, minute - tzMin, second));
}

// Funktion zum Finden des aktuellen Programms basierend auf der Uhrzeit
function getCurrentProgram(channelId) {
    const now = new Date();
    if (epgData[channelId]) {
        const currentProgram = epgData[channelId].find(prog => now >= prog.start && now < prog.stop);
        if (currentProgram) {
            const pastTime = now - currentProgram.start;
            const futureTime = currentProgram.stop - now;
            const totalTime = currentProgram.stop - currentProgram.start;
            return {
                title: `${currentProgram.title.replace(/\s*\[.*?\]\s*/g, '').replace(/[\[\]]/g, '')} (${currentProgram.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${currentProgram.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                description: currentProgram.desc || 'Keine Beschreibung verfügbar',
                pastPercentage: (pastTime / totalTime) * 100,
                futurePercentage: (futureTime / totalTime) * 100
            };
        }
    }
    return { title: 'Keine aktuelle Sendung verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
}

// Funktion zum Aktualisieren des Players mit der Programmbeschreibung
function updatePlayerDescription(title, description) {
    document.getElementById('program-title').textContent = title;
    document.getElementById('program-desc').textContent = description;
}

// Funktion zum Aktualisieren der nächsten Programme
function updateNextPrograms(channelId) {
    const nextProgramsContainer = document.getElementById('next-programs');
    nextProgramsContainer.innerHTML = '';

    if (epgData[channelId]) {
        const now = new Date();
        const upcomingPrograms = epgData[channelId].filter(prog => prog.start > now).slice(0, 4);

        upcomingPrograms.forEach(program => {
            const nextProgramDiv = document.createElement('div');
            nextProgramDiv.classList.add('next-program');

            const nextProgramTitle = document.createElement('h4');
            nextProgramTitle.classList.add('next-program-title');
            const title = program.title.replace(/\s*\[.*?\]\s*/g, '').replace(/[\[\]]/g, '');
            nextProgramTitle.textContent = `${title} (${program.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${program.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

            const nextProgramDesc = document.createElement('p');
            nextProgramDesc.classList.add('next-program-desc');
            nextProgramDesc.textContent = program.desc || 'Keine Beschreibung verfügbar';
            nextProgramDesc.style.display = 'none';

            nextProgramDiv.appendChild(nextProgramTitle);
            nextProgramDiv.appendChild(nextProgramDesc);

            nextProgramTitle.addEventListener('click', () => {
                nextProgramDesc.style.display = nextProgramDesc.style.display === 'none' ? 'block' : 'none';
                updateProgramInfo(title, nextProgramDesc.textContent);
            });

            nextProgramsContainer.appendChild(nextProgramDiv);
        });
    }
}

// Im Event-Handler für den Klick auf einen Sender
const sidebarList = document.getElementById('sidebar-list');
sidebarList.addEventListener('click', event => {
    const channelInfo = event.target.closest('.channel-info');
    if (channelInfo) {
        const channelId = channelInfo.dataset.channelId;
        const programInfo = getCurrentProgram(channelId);
        setCurrentChannel(channelInfo.querySelector('.sender-name').textContent, channelInfo.dataset.stream);
        playStream(channelInfo.dataset.stream);
        updatePlayerDescription(programInfo.title, programInfo.description);
        updateNextPrograms(channelId);
        document.getElementById('current-channel-logo').src = channelInfo.querySelector('.logo-container img').src;
    }
});

// Funktion zum Setzen des aktuellen Sendernamens und der URL
function setCurrentChannel(channelName, streamUrl) {
    document.getElementById('current-channel-name').textContent = channelName;
    document.getElementById('stream-url').value = streamUrl;
}

// Aktualisierung der Uhrzeit
function updateClock() {
    const now = new Date();
    document.getElementById('tag').textContent = now.toLocaleDateString('de-DE', { weekday: 'long' });
    document.getElementById('datum').textContent = now.toLocaleDateString('de-DE');
    document.getElementById('uhrzeit').textContent = now.toLocaleTimeString('de-DE', { hour12: false });
}

// Funktion zum Abspielen eines Streams im Video-Player
function playStream(streamURL, subtitleURL) {
    const videoPlayer = document.getElementById('video-player');
    const subtitleTrack = document.getElementById('subtitle-track');

    if (subtitleURL) {
        subtitleTrack.src = subtitleURL;
        subtitleTrack.track.mode = 'showing';
    } else {
        subtitleTrack.src = '';
        subtitleTrack.track.mode = 'hidden';
    }

    if (Hls.isSupported() && streamURL.endsWith('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, () => videoPlayer.play());
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl') && streamURL.endsWith('.m3u8')) {
        videoPlayer.src = streamURL;
        videoPlayer.addEventListener('loadedmetadata', () => videoPlayer.play());
    } else if (streamURL.endsWith('.mpd')) {
        const dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(videoPlayer, streamURL, true);
    } else if (videoPlayer.canPlayType('video/mp4') || videoPlayer.canPlayType('video/webm')) {
        videoPlayer.src = streamURL;
        videoPlayer.play();
    } else {
        console.error('Stream-Format wird vom aktuellen Browser nicht unterstützt.');
    }
}

// Funktion zum Konvertieren von SRT in VTT
function convertSrtToVtt(srtContent) {
    return 'WEBVTT\n\n' + srtContent.replace(/\r\n|\r|\n/g, '\n').replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
}

// Funktion zum Laden der Playlist-URLs aus playlist-urls.txt und Aktualisieren der Sidebar
function loadPlaylistUrls() {
    fetch('playlist-urls.txt')
        .then(response => response.text())
        .then(data => {
            const playlistList = document.getElementById('playlist-url-list');
            playlistList.innerHTML = '';
            data.split('\n').forEach(line => {
                const [label, url] = line.split(',').map(part => part.trim());
                if (label && url) {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.textContent = label;
                    link.href = '#';
                    link.addEventListener('click', event => {
                        event.preventDefault();
                        document.getElementById('stream-url').value = url;
                        fetch(url)
                            .then(response => response.text())
                            .then(data => updateSidebarFromM3U(data))
                            .catch(error => console.error('Fehler beim Laden der Playlist:', error));
                    });
                    li.appendChild(link);
                    playlistList.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der Playlist URLs:', error));
}

// Event-Listener für den Klick auf den Playlist-URLs-Titel
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.content-title[onclick="toggleContent(\'playlist-urls\')"]').addEventListener('click', loadPlaylistUrls);
});

// Event-Listener für den Filter-Online-Button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-online-button').addEventListener('click', () => {
        document.querySelectorAll('#sidebar-list li').forEach(item => {
            const channelInfo = item.querySelector('.channel-info');
            item.style.display = channelInfo && channelInfo.classList.contains('online') ? '' : 'none';
        });
    });

    document.getElementById('show-all-button').addEventListener('click', () => {
        document.querySelectorAll('#sidebar-list li').forEach(item => item.style.display = '');
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        let firstVisibleItem = null;
        document.querySelectorAll('#sidebar-list li').forEach(item => {
            const text = item.textContent || item.innerText;
            item.style.display = text.toLowerCase().includes(filter) ? '' : 'none';
            if (!firstVisibleItem && item.style.display === '') {
                firstVisibleItem = item;
            }
        });

        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter' && firstVisibleItem) {
                playStream(firstVisibleItem.querySelector('.channel-info').dataset.stream);
            }
        });
    });

    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkStreamStatus, 60000);
});

// Funktion zum Überprüfen des Status der Streams und Markieren der gesamten Sidebar-Einträge
function checkStreamStatus() {
    document.querySelectorAll('.channel-info').forEach(channel => {
        const streamURL = channel.dataset.stream;
        if (streamURL) {
            fetch(streamURL)
                .then(response => {
                    channel.classList.toggle('online', response.ok);
                    channel.querySelector('.sender-name').style.color = response.ok ? 'lightgreen' : '';
                    channel.querySelector('.sender-name').style.fontWeight = response.ok ? 'bold' : '';
                })
                .catch(error => {
                    channel.classList.remove('online');
                    channel.querySelector('.sender-name').style.color = '';
                    channel.querySelector('.sender-name').style.fontWeight = '';
                });
        }
    });
}

// Funktion zum Aktualisieren der Sidebar von einer M3U-Datei
async function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const extractStreamURLs = (data) => {
        const urls = {};
        data.split('\n').forEach(line => {
            if (line.startsWith('#EXTINF')) {
                const idMatch = line.match(/tvg-id="([^"]+)"/);
                const channelId = idMatch ? idMatch[1] : null;
                if (channelId && !urls[channelId]) {
                    urls[channelId] = [];
                }
            } else if (line.startsWith('http')) {
                const currentChannelId = Object.keys(urls).pop();
                if (currentChannelId) {
                    urls[currentChannelId].push(line.trim());
                }
            }
        });
        return urls;
    };

    const streamURLs = extractStreamURLs(data);

    for (const channelId in streamURLs) {
        const programInfo = getCurrentProgram(channelId);
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="channel-info" data-stream="${getProxiedURL(streamURLs[channelId][0])}" data-channel-id="${channelId}">
                <div class="logo-container">
                    <img src="${streamURLs[channelId][1] || 'default_logo.png'}" alt="Logo">
                </div>
                <span class="sender-name">${channelId}</span>
                <span class="epg-channel">
                    <span>${programInfo.title}</span>
                    <div class="epg-timeline">
                        <div class="epg-past" style="width: ${programInfo.pastPercentage}%"></div>
                        <div class="epg-future" style="width: ${programInfo.futurePercentage}%"></div>
                    </div>
                </span>
            </div>
        `;
        sidebarList.appendChild(listItem);
    }

    checkStreamStatus();
}
