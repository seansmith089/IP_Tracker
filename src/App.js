import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// IMAGE IMPORTS
import arrow from "./images/icon-arrow.svg";
import marker from "./images/icon-location.svg";

let L = window.L;
let icon = L.icon({
  iconUrl: marker,
});

// MAP LAYER
let mapTiles = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

function App() {
  const [userInput, setUserInput] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [isp, setIsp] = useState("");
  const [city, setCity] = useState("");
  const [ip, setIP] = useState("");
  const [timeZone, setTimeZone] = useState("");

  function MapComponent(props) {
    const map = useMap();
    map.setView(props.center, props.zoom);
    return null;
  }

  // RAN ON FIRST VISIT TO GET USERS IP. THIS SETS THE INITIAL MAP LOCATION
  function getUserIp() {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        setIP(data.ip);
        getLocationInfo(data.ip);
      });
  }

  // SUBSEQUENT INFO IS THEN PULLED FROM ANOTHER API BASED ON THE IP INFO
  async function getLocationInfo(ip) {
    await fetch(`http://ip-api.com/json/${ip}`)
      .then((response) => response.json())
      .then((data) => {
        setIP(data.query);
        setLat(data.lat);
        setLong(data.lon);
        setIsp(data.isp);
        setCity(data.city);
        setTimeZone(data.timezone);
      });
  }

  useEffect(() => {
    getUserIp();
  }, []);

  // INPUT HANDLERS
  function clickHandler() {
    setUserInput("");
    setIP("");
  }

  function inputHandler(e) {
    setUserInput(e.target.value);
  }

  // BUTTON HANDLER
  function buttonHandler(event) {
    event.preventDefault();
    if (userInput.includes(".")) {
      getLocationInfo(userInput);
    } else {
      setLat(undefined);
      setLong(undefined);
    }
  }

  return (
    <div className="page-container">
      <div className="input-container">
        <h1 className="app-title">IP Address Tracker</h1>
        <form action="">
          <div className="button-container">
            <input
              value={userInput}
              id="input-box"
              onChange={(e) => inputHandler(e)}
              type="text"
              placeholder="Search for any IP address or domain"
              autocomplete="off"
            />
            <button onClick={(e) => buttonHandler(e, ip)}>
              <img src={arrow}></img>
            </button>
          </div>
        </form>
        {lat === undefined && (
          <div className="error-container">
            <h1 className="error">
              Sorry, we're unable to find anything for this search. Please try
              another IP or domain
            </h1>
          </div>
        )}

        <div className="info-container">
          <div className="wrapper">
            <p className="title">IP ADDRESS</p>
            <p className="result">{ip}</p>
          </div>
          <div className="line"></div>
          <div className="wrapper">
            <p className="title">TIMEZONE</p>
            <p className="result">{timeZone}</p>
          </div>
          <div className="line"></div>
          <div className="wrapper">
            <p className="title">LOCATION</p>
            <p className="result">{city}</p>
          </div>
          <div className="line"></div>
          <div className="wrapper">
            <p className="title">ISP</p>
            <p className="result">{isp}</p>
          </div>
        </div>
      </div>

      <MapContainer
        center={
          lat === undefined || long === undefined
            ? [-33.8688, 151.2093]
            : [lat, long]
        }
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}" />
        <MapComponent
          center={
            lat === undefined || long === undefined
              ? [-33.8688, 151.2093]
              : [lat, long]
          }
        ></MapComponent>
        <Marker
          icon={icon}
          position={
            lat === undefined || long === undefined
              ? [-33.8688, 151.2093]
              : [lat, long]
          }
          zoom={13}
        ></Marker>
      </MapContainer>
    </div>
  );
}

export default App;
