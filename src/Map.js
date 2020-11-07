import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import {getArticles} from './Api.js';


mapboxgl.accessToken =
  'pk.eyJ1Ijoic21hcnRmZW5uZWMiLCJhIjoiY2toNzZiMXB2MDV2YTJ4cWg0anhpZW1hMSJ9.CQfaKPy9w2fATpuN2aRftQ';

const Map = () => {
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(1.5);


  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/smartfennec/ckh76foov0cpz1bqd8vfpubz6',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    map.on('load', function () {
      setInterval(async () => {
        const articles = await getArticles();

        map.addSource('places', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': articles.map((article) => (
              {
                'type': 'Feature',
                'properties': {
                  'description': `<p>${article.date}</p><p>${article.text}</p>`,
                  'icon': 'marker'
                },
                'geometry': article.location
              })
            )
          }
        });
      }, 5000);

      // Add a layer showing the places.
      map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
          'icon-image': '{icon}-15',
          'icon-allow-overlap': true
        },
        'paint': {
          "icon-color": "#ff0000"
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
      });
    });

    // Clean up on unmount
    return () => map.remove();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
