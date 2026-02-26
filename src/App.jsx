import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

// Services & Feature Imports
import { db } from "./services/firebaseConfig.js"; 
import GardenGrid from './features/map/GardenGrid';
import InventoryTable from './features/inventory/InventoryTable';
import AdminPanel from './features/admin/AdminPanel';

export default function App() {
  const [state, setState] = useState({
    config: { 'grid-main': { label: 'Main Garden', rows: 15, cols: 9 } },
    data: { 'grid-main': {} },
    env: {}, // 🔥 Environmental Log Storage
    seedBank: [],
    wishlist: [],
    supplies: []
  });

  const [activeId, setActiveId] = useState(null);
  const [activeBedId, setActiveBedId] = useState('grid-main');
  const [view, setView] = useState('dashboard');

  const sensors = useSensors(useSensor(PointerSensor, { 
    activationConstraint: { distance: 8 } 
  }));

  // Real-time Cloud Sync
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gardens", "smyrna-master"), (doc) => {
      if (doc.exists()) {
        setState(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const commitState = async (newState) => {
    setState(newState);
    try {
      await updateDoc(doc(db, "gardens", "smyrna-master"), newState);
    } catch (err) {
      console.error("Cloud Sync Error:", err);
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !activeBedId) return;

    const seed = state.seedBank.find(s => s.id === active.id);
    if (seed) {
      const newState = { ...state };
      if (!newState.data[activeBedId]) newState.data[activeBedId] = {};
      
      newState.data[activeBedId][over.id] = {
        ...seed,
        instanceId: `inst-${Date.now()}`,
        datePlanted: new Date().toISOString()
      };
      commitState(newState);
    }
  };

  const removePlant = (coord) => {
    const newState = { ...state };
    if (newState.data[activeBedId]) {
      delete newState.data[activeBedId][coord];
      commitState(newState);
    }
  };

  const activeSeed = state.seedBank.find(s => s.id === activeId);

  // Night Mode Styles
  const appContainer = {
    maxWidth: '1440px', margin: '0 auto', padding: '20px', 
    backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#eee',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const bedBtn = (active) => ({
    padding: '10px 20px', background: active ? '#2e7d32' : '#1a1a1a',
    color: active ? '#fff' : '#888', border: active ? '1px solid #4caf50' : '1px solid #333',
    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
  });

  return (
    <div style={appContainer}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#4caf50', fontSize: '24px' }}>GreenStack 2.0 ☁️</h1>
            <div style={{ fontSize: '12px', color: '#666' }}>Smyrna HQ // {new Date().toLocaleDateString()}</div>
          </div>
          
          <nav style={{ display: 'flex', gap: '10px' }}>
            {Object.keys(state.config || {}).map(id => (
              <button key={id} onClick={() => {setView('dashboard'); setActiveBedId(id);}} 
                style={bedBtn(activeBedId === id && view === 'dashboard')}>
                {state.config[id].label}
              </button>
            ))}
            <button onClick={() => setView('admin')} style={bedBtn(view === 'admin')}>⚙️ Admin</button>
          </nav>
        </header>

        <main style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: '3' }}>
            {view === 'dashboard' ? (
              <GardenGrid 
                label={state.config[activeBedId]?.label}
                rows={state.config[activeBedId]?.rows} 
                columns={state.config[activeBedId]?.cols} 
                gridData={state.data[activeBedId] || {}} 
                envData={state.env?.[activeBedId] || {}} // 🔥 Environmental Data Pass
                onRemovePlant={removePlant}
              />
            ) : (
              <AdminPanel 
                gardenState={state} 
                setGardenState={commitState} 
                onReset={() => commitState({
                  config: { 'grid-main': { label: 'Main Garden', rows: 15, cols: 9 } },
                  data: { 'grid-main': {} },
                  env: {},
                  seedBank: [],
                  supplies: []
                })} 
              />
            )}
          </div>
          <aside style={{ flex: '1', position: 'sticky', top: '20px', height: 'fit-content' }}>
            <InventoryTable seedBank={state.seedBank} />
          </aside>
        </main>

        <DragOverlay>
          {activeId && activeSeed && (
            <div style={{ padding: '12px 20px', background: '#1a1a1a', border: '2px solid #4caf50', borderRadius: '8px', zIndex: 9999, color: '#fff' }}>
              🌱 {activeSeed.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}