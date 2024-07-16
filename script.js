document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('videoPlayer');
    const channelList = document.getElementById('channelList');

    // Event Listener für Klick auf Sender in der Sidebar
    channelList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const streamUrl = event.target.getAttribute('data-url');
            if (streamUrl) {
                videoPlayer.src = streamUrl;
                videoPlayer.play();
            }
        }
    });
});
