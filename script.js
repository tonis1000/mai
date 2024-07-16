document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('videoPlayer');
    const streamUrl = 'http://onceeer.top:8080/';
    const username = 'xxxrestream';
    const password = 'fghiBrdf55';

    // Setze die Videoquelle mit Basic-Auth
    videoPlayer.src = streamUrl;
    videoPlayer.addEventListener('loadedmetadata', function() {
        console.log('Video geladen:', videoPlayer.duration);
    });
});
