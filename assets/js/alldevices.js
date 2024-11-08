document.addEventListener("DOMContentLoaded", async function () {
  const authToken = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  const tableBody = document.getElementsByTagName("tbody");
  // console.log(authToken);
  async function fetchData() {
    try {
      const response = await fetch(
        `https://dms.meshaenergy.com/apis/alldevices/primary-data/${customerId}/${authToken}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log(data);
      const status = "Online";
      tableBody[0].innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tableRow = document.createElement("tr");
        //<td>Id : #${customerId}</td>
        tableRow.innerHTML = `
          <td>${row.device_id}</td>
          <td>
            <div class="color_box" style="background-color: ${
              status === "Online" ? "#00B562" : "#626C70"
            };">
              <p>${status}</p>
            </div>
          </td>
          <td>${row.v1}</td>
          <td>${row.v2}</td>
          <td>${row.v3}</td>
          <td>${row.v4}</td>
          <td>${ (Number(row.v1) + Number(row.v2) + Number(row.v3) + Number(row.v4)).toFixed(2) }</td>
          <td>${row.current}</td>
          <td id="distance${row.device_id}"></td>
          <td>${row.temperature}</td>
          <!--<td><button class="btn btn_local_style">View</button></td>-->
          <td><button class="btn btn_local_style" onclick="openMapModal(${
            row.lat
          }, ${row.long})">View</button>
          <td>${formatDate(row.device_log_date)}<br />${
          row.latest_updated_time
        }</td>
          <td>
            <!--<button class="icon_button"><i style="color: #626C70;" class="bi bi-eye-fill"></i></button>-->
            <a href="https://dms.meshaenergy.com/apis/download/csv/today/${row.device_id}/${authToken}" download><button class="icon_button"><i style="color: #626C70;" class="bi bi-download"></i></button></a>
          </td>
        `;
        fetchDistance(row.device_id, authToken);
        fetchDeviceIds(customerId,authToken);
        tableBody[0].appendChild(tableRow);
      }
    } catch (error) {
      console.log(error);
    }
  }
  fetchData();
  setInterval(fetchData, 30000);
});

// auth check
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "index.html";
  }
}
window.onload = checkAuth;
// Add logout event listener
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("authToken");
  localStorage.removeItem("customerId");
  localStorage.clear();
  window.location.href = "index.html";
});

// map modal
function convertToDecimalDegrees(coordinate) {
  const degrees = Math.floor(coordinate / 100);
  const minutes = coordinate - degrees * 100;
  const decimalDegrees = degrees + minutes / 60;

  return decimalDegrees;
}
function initMap(lat, lng) {
  // console.log(lat, Number(lng));
  const location = {
    lat: convertToDecimalDegrees(Number(lat)),
    lng: convertToDecimalDegrees(Number(lng)),
  };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
  });
  const icon = {
    url: "https://i.postimg.cc/76gy7c3M/auto.png",
    scaledSize: new google.maps.Size(48, 48),
  };

  const marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: icon,
  });
}

function openMapModal(lat, lng) {
  var mapModal = document.getElementById("mapModal");
  var bsModal = new bootstrap.Modal(mapModal);

  // Event listener for when the modal is shown
  mapModal.addEventListener(
    "shown.bs.modal",
    function () {
      initMap(lat, lng);
    },
    { once: true }
  ); // Use { once: true } to ensure the event listener is only triggered once

  bsModal.show();
}
// map modal

// dateformatter
function formatDate(dateString) {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${year}`;
}

function fetchDistance(deviceId, authToken) {
  if (!deviceId) {
    deviceId = "MESH2099";
  }
  // console.log(deviceId, authToken);
  fetch(
    `https://dms.meshaenergy.com/apis/distance-travelled/${deviceId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      document.getElementById(`distance${deviceId}`).innerHTML =
        data[0].distance_in_kms.toFixed(2);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function fetchDeviceIds(customerId, authToken) {
  fetch(
    `https://dms.meshaenergy.com/apis/devices/all/${customerId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      optionsTemplet = ``;
      data.forEach((element) => {
        optionsTemplet += `<option value="${element.device_id}">${element.device_id}</option>`;
      });
      document.getElementById("devices").innerHTML = optionsTemplet;
      //let currentDeviceId = localStorage.getItem("selectedDeviceId");
      //if (!currentDeviceId) {
      //    localStorage.setItem("selectedDeviceId", data[0].device_id);
      //}
      //document.getElementById("devices").value =
      // localStorage.getItem("selectedDeviceId");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
