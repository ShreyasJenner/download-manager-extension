/* Adds event listener that checks if the button is pressed */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('Start_Download').addEventListener('click', () => {
        console.log("Started Download");
        main(); // Start your long-running task
    });

    document.getElementById('Pause_Download').addEventListener('click', async () => {
        console.log("Pausing Download");
        const result = await browser.storage.local.get("Download_Manager_donwload_id");
        console.log("pause id:", result.Download_Manager_download_id);
        pauseDownload(result.Download_Manager_download_id);
    });

    document.getElementById('Resume_Download').addEventListener('click', async () => {
        console.log("Resuming Download");
        const result = await browser.storage.local.get("Download_Manager_donwload_id");
        resumeDownload(result.Download_Manager_download_id);
    });
});