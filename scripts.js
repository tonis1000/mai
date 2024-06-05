<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub TV</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
</head>
<body>
    <div class="main-container">
        <div class="container">
            <div class="info-panel">
                <div class="info-group">
                    <span id="tag"></span>
                </div>
                <div class="info-group">
                    <span id="datum"></span>
                </div>
                <div class="info-group">
                    <span id="uhrzeit"></span>
                </div>
            </div>
            <div class="button-row">
                <button id="myPlaylist">Meine Playlist</button>
                <button id="externalPlaylist">Externe Playlist</button>
                <button id="sportPlaylist">Sport</button>
            </div>
        </div>
        <div class="sidebar" id="sidebar">
            <h2>Senderliste</h2>
            <div class="sidebar-content">
                <ul id="sidebar-list"></ul>
            </div>
        </div>
    </div>
    <div class="content-wrapper">
        <div class="player-container">

            <div class="player-header">
                <div class="logo-container player-logo-container">
                    <img id="current-channel-logo" alt="Senderlogo">
                </div>
                <div class="player-info-container">
                    <div class="player-info-top">
                        <span id="current-channel-name">Aktueller Sender</span>
                        <button id="clear-button">Leeren</button>
                        <button id="insert-button">Einfügen</button>
                        <button id="copy-button">Kopieren</button>
                        <button id="playlist-button">Playlist</button>
                    </div>
                    <div class="player-info-bottom">
                        <input type="text" id="stream-url" placeholder="Stream URL eingeben">
                        <button id="play-button">Play</button>
                        <label for="subtitle-file" style="cursor: pointer;">SRT</label>
                        <input type="file" id="subtitle-file" accept=".srt" style="display: none;">
                    </div>
                </div>
            </div>

            <video id="video-player" controls>
                <track id="subtitle-track" kind="subtitles" srclang="el" label="Griechisch" default>
            </video>
            <div id="program-info">
                <h4 id="program-title"></h4>
                <p id="program-desc"></p>
            </div>

            <div id="next-programs">
                <!-- Container für die nächsten Programme -->
                <div class="next-program">
                    <h4 class="next-program-title">Nächstes Programm 1 (09:00 - 10:00)</h4>
                    <p class="next-program-desc" style="display: none;">Beschreibung des nächsten Programms 1</p>
                </div>
                <div class="next-program">
                    <h4 class="next-program-title">Nächstes Programm 2 (10:00 - 11:00)</h4>
                    <p class="next-program-desc" style="display: none;">Beschreibung des nächsten Programms 2</p>
                </div>
                <div class="next-program">
                    <h4 class="next-program-title">Nächstes Programm 3 (11:00 - 12:00)</h4>
                    <p class="next-program-desc" style="display: none;">Beschreibung des nächsten Programms 3</p>
                </div>
                <div class="next-program">
                    <h4 class="next-program-title">Nächstes Programm 4 (12:00 - 13:00)</h4>
                    <p class="next-program-desc" style="display: none;">Beschreibung des nächsten Programms 4</p>
                </div>
            </div>

        </div>

        <div class="additional-content">
            <div class="content-title" onclick="toggleContent()">Foothubhd</div>
            <div class="content-body" id="contentBody">
                <iframe src="https://foothubhd.xyz/" frameborder="0" width="100%" height="100%"></iframe>
            </div>
        </div>

    </div>
    <script src="scripts.js"></script>
</body>
</html>
