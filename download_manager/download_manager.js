document.getElementById("start_download").addEventListener("click", startDownload); 

document.getElementById("pause_download").addEventListener("click", pauseDownload); 

document.getElementById("resume_download").addEventListener("click", resumeDownload); 

/* temporary function to start a download from a pre-determined link */
async function startDownload() {
    const downUrl = "https://ash-speed.hetzner.com/100MB.bin";

    let id = await browser.downloads.download({url: downUrl});

    let storage_id = [id];

    browser.storage.local.set({storage_id});
}

/* Function to pause the download */
async function pauseDownload() {
    let id = await browser.storage.local.get("storage_id");
    
    let pausing = browser.downloads.pause(id.storage_id[0]);

    console.log(pausing);
}

/* Function to resume download */
async function resumeDownload() {
    let id = await browser.storage.local.get("storage_id");
    
    let resuming = browser.downloads.resume(id.storage_id[0]);

    console.log(resuming);
}