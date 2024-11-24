/* wait for button click message to be sent */
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "start_download") {
        console.log("Started Download");
        main(); // Start your long-running task
        return Promise.resolve({ status: "Task started" });
    } else if(message.action === "pause_download") {
        console.log("Pausing Download");
        pauseDownload(browser.storage.local.get("Download_Manager_download_id"));
    } else if(message.action === "resume_download") {
        console.log("Resuming Download");
        resumeDownload(browser.storage.local.get("Download_Manager_download_id"));
    }
});