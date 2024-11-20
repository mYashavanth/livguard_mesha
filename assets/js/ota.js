const authToken = localStorage.getItem("authToken");
const customerId = localStorage.getItem("customerId");
function handleFileUpload(event) {
  event.preventDefault();
  const fileInput = document.getElementById("file-input");
  const deviceSelect = document.getElementById("device-select");

  if (fileInput.files.length > 0 && deviceSelect.value) {
    const file = fileInput.files[0];
    console.log("Selected File:", file);
    console.log("Selected Device ID:", deviceSelect.value);
    alert(`File: ${file.name} uploaded for Device ID: ${deviceSelect.value}`);
  } else {
    alert("Please select both a file and a device ID.");
  }
}

function handleDragOver(event) {
  event.preventDefault();
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.add("drag-over");
}

function handleDragLeave(event) {
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === "text/plain") {
      updateFileDetails(file); // Update the UI with file details
      const fileInput = document.getElementById("file-input");
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files; // Sync file input for form submission
    } else {
      alert("Only .txt files are allowed.");
    }
  }
}
function triggerFileInput() {
  const fileInput = document.getElementById("file-input");
  fileInput.click(); // Trigger the hidden input when the area is clicked
}
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.type === "text/plain") {
      updateFileDetails(file); // Update the UI with file details
    } else {
      alert("Only .txt files are allowed.");
      resetFile();
    }
  }
}

function updateFileDetails(file) {
  const fileInfo = document.getElementById("file-info");

  const dropArea = document.getElementById("drop-area");

  fileInfo.classList.remove("d-none");
  dropArea.classList.add("d-none");
  document.getElementById("file-name").textContent = file.name;
  document.getElementById("file-size").textContent = formatFileSize(file.size);
}
function formatFileSize(size) {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function resetFile() {
  const fileInput = document.getElementById("file-input");
  fileInput.value = ""; // Clear the file input
  document.getElementById("file-info").classList.add("d-none");
  document.getElementById("drop-area").classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", async function () {
  const deviceId = document.getElementById("device-select");
  const deviceData = await fetchDeviceData();
  console.log(deviceData);

  if (deviceData) {
    console.log("User Role data:", deviceData);
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select Device ID";
    deviceId.appendChild(option);
    deviceData.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.id;
      option.textContent = device.device_id;
      deviceId.appendChild(option);
    });

    deviceId.addEventListener("change", async function () {
      const selectedDeviceId = this.value;
      console.log({ selectedDeviceId });
    });
  }
});

async function fetchDeviceData() {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://dms.meshaenergy.com/apis/devices/all/${customerId}/${authToken}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errFlag === 1) {
      window.location.href = "login.html";
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
    return null;
  }
}