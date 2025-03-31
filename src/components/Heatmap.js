'use client';

import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Dados para o heatmap (melhor organizado)
const HEATMAP_DATA = [
  [-46.6333, -23.5505, 0.6], // [longitude, latitude, intensidade]
  [-46.6400, -23.5600, 0.8],
  [-46.6500, -23.5400, 0.4],
  [-46.6200, -23.5300, 0.7],
  [-46.6250, -23.5550, 0.9],
];


function HeatmapLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatmapLayer = L.heatLayer(HEATMAP_DATA, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: { 
        0.4: 'blue', 
        0.6: 'cyan', 
        0.7: 'lime', 
        0.8: 'yellow', 
        1.0: 'red' 
      }
    }).addTo(map);

    return () => map.removeLayer(heatmapLayer);
  }, [map]);

  return null;
}

function CityBorder() {
    const [cityGeoJSON, setCityGeoJSON] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const loadGeoJSON = async () => {
        try {
          const response = await fetch('/maps/sao_paulo_cidade.json');
          if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
          
          const data = await response.json();
          
          // Validação básica do GeoJSON
          if (!data?.features?.[0]?.geometry?.coordinates) {
            throw new Error('GeoJSON inválido - estrutura incorreta');
          }
  
          setCityGeoJSON(data);
        } catch (err) {
          console.error("Falha ao carregar GeoJSON:", err);
          setError(err.message);
          
          // Fallback com coordenadas aproximadas de SP
          setCityGeoJSON({
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [-46.825, -23.700], [-46.825, -23.400],
                  [-46.350, -23.400], [-46.350, -23.700],
                  [-46.825, -23.700]
                ]]
              }
            }]
          });
        } finally {
          setLoading(false);
        }
      };
  
      loadGeoJSON();
    }, []);
  
    if (loading) return null;
  
    return (
      <>
        {/* 1. Primeiro renderiza o contorno da cidade */}
        {cityGeoJSON && (
          <GeoJSON
            key="city-outline"
            data={cityGeoJSON}
            style={{
              fillColor: "transparent",
              fillOpacity: 0,
              color: "#000000",
              weight: 2,
              opacity: 0.8
            }}
          />
        )}
        
        {/* 2. Depois cria um polígono invertido para mascarar o resto do mundo */}
        {cityGeoJSON && (
          <GeoJSON
            key="world-mask"
            data={{
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  // Borda externa (todo o mundo)
                  [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]],
                  // Borda interna (corte da cidade de SP - invertido)
                  ...cityGeoJSON.features[0].geometry.coordinates
                ]
              }
            }}
            style={{
              fillColor: "white",
              fillOpacity: 0.7,
              color: "transparent",
              weight: 0
            }}
          />
        )}
      </>
    );
  }

export default function MapaOutorga() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      position: 'relative' 
    }}>
      <MapContainer
       center={[-23.5505, -46.6333]} 
       zoom={12}
       minZoom={10.3} 
       maxZoom={16}
       maxBounds={[
         [-25.5, -49.0], 
         [-21.5, -44.0]
       ]}
       maxBoundsViscosity={1.0} 
       style={{ 
         height: '100vh', 
         width: '100%' 
       }}
     >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <HeatmapLayer />
        <CityBorder />
      </MapContainer>
      
      {/* Legenda do heatmap */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        color: 'black'
      }}>
        <h4 style={{ marginTop: 0 }}>Intensidade de Outorgas</h4>
        {[
          { color: 'blue', label: 'Baixa' },
          { color: 'cyan', label: 'Média' },
          { color: 'lime', label: 'Alta' },
          { color: 'red', label: 'Muito Alta' }
        ].map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: index < 3 ? '5px' : 0 
          }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              background: item.color, 
              marginRight: '10px' 
            }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}