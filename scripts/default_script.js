

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('myButton').addEventListener('click', () => {
        browser.runtime.sendMessage({ action: "start_task" }).then((response) => {
            console.log(response.status); // Logs "Task started"
        });
    });
});