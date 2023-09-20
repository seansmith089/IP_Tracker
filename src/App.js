import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import arrow from "./images/icon-arrow.svg";
import marker from "./images/icon-location.svg";

let api_key = process.env.REACT_APP_API_KEY;

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
        getLocationInfo_IP(data.ip);
      });
  }

  // SUBSEQUENT INFO IS THEN PULLED FROM ANOTHER API BASED ON THE IP INFO
  async function getLocationInfo_IP(input) {
    try{
      await fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=${api_key}&ipAddress=${userInput}`)
      .then((response) => response.json())
      .then((data) => {
        setIP(data.ip);
        setLat(data.location.lat);
        setLong(data.location.lng);
        setIsp(data.isp);
        setCity(data.location.city);
        setTimeZone("UTC " + data.location.timezone);
      });
    }catch{
      setLat(undefined);
      setLong(undefined);
    }
  }

  async function getLocationInfo_domain(input) {
    try {
      await fetch(
        `https://geo.ipify.org/api/v2/country,city?apiKey=${api_key}&domain=${userInput}`
      )
        .then((response) => response.json())
        .then((data) => {
          setIP(data.ip);
          setLat(data.location.lat);
          setLong(data.location.lng);
          setIsp(data.isp);
          setCity(data.location.city);
          setTimeZone("UTC " + data.location.timezone);
        });
    } catch {
      setLat(undefined);
      setLong(undefined);
      setIP("");
      setIsp("");
      setCity("");
      setTimeZone("");
    }
  }

  useEffect(() => {
    getUserIp();
  }, []);

  // INPUT HANDLERS
  function clickHandler() {
    setUserInput("");
  }

  function inputHandler(e) {
    setUserInput(e.target.value);
  }

  // BUTTON HANDLER
  function buttonHandler(event) {
    event.preventDefault();
    if (userInput.includes(".")) {
      getLocationInfo_IP(userInput);
    } else {
      setLat(undefined);
      setLong(undefined);
      setIP("");
      setIsp("");
      setCity("");
      setTimeZone("");
    }
  }

    
  function validateInput(event) {
    event.preventDefault();
    if (
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        userInput
      )
    ) {
      getLocationInfo_IP(userInput);
      console.log("correct IP Address");
    } else if (
      /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/.test(userInput)
    ) {
      getLocationInfo_domain(userInput);
      console.log("correct domain");
    } else {
      setLat(undefined);
      setLong(undefined);
      setIP("");
      setIsp("");
      setCity("");
      setTimeZone("");
      console.log("Incorrect Info, try again");
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
              onClick={() => clickHandler()}
              type="text"
              placeholder="Search for any IP address or domain"
              autocomplete="off"
            />
            <button onClick={(e) => validateInput(e)}>
              <img src={arrow} alt="arrow-icon"></img>
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
