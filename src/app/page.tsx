'use client';

import dynamic from 'next/dynamic';

// Carrega o mapa dinamicamente (SSR desativado)
const MapaOutorga = dynamic(() => import('../components/Heatmap'), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>
});

export default function Home() {
  return (
    <main>
      <h1>Mapa de Outorga Onerosa - São Paulo</h1>
      <MapaOutorga />
    </main>
  );
}