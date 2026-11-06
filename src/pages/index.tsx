import React from 'react'

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <h1>Sentinel Weave</h1>
      <p>Lightweight threat detection prototype. Use the API endpoints to ingest events and query alerts.</p>
      <ul>
        <li>POST /api/ingest — ingest event</li>
        <li>GET /api/alerts — fetch alerts</li>
        <li>GET/POST /api/rules — list and create rules</li>
      </ul>
    </main>
  )
}
