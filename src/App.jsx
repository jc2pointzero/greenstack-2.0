import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from "./services/firebaseConfig.js"; 
import GardenGrid from './features/map/GardenGrid';
import InventoryTable from './features/inventory/InventoryTable';
import AdminPanel from './features/admin/AdminPanel';

export default function App() {
  const [state, setState] = useState({ config: {}, data: {}, env: {}, seedBank: [], supplies: [] });
  const [hasLoaded, setHasLoaded] = useState(false);
  const isInitialLoad = useRef(true); 
  const [activeId, setActiveId] = useState(null);
  const [activeBedId, setActiveBedId] = useState('');
  const [view, setView] = useState('dashboard');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "greenstack", "global_state"), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        setState(cloudData);
        if (isInitialLoad.current && Object.keys(cloudData.config || {})[0]) {
          setActiveBedId(Object.keys(cloudData.config)[0]);
        }
      }
      setHasLoaded(true);
      setTimeout(() => { isInitialLoad.current = false; }, 1000);
    });
    return () => unsub();
  }, []);

  const commitState = async (newState) => {
    if (isInitialLoad.current || !hasLoaded) return; 
    setState(newState);
    try {
      await setDoc(doc(db, "greenstack", "global_state"), newState, { merge: true });
    } catch (err) { console.error("Firebase Sync Error:", err); }
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
      newState.data[activeBedId][over.id] = { ...seed, instanceId: `inst-${Date.now()}` };
      commitState(newState);
    }
  };

  const activeSeed = state.seedBank.find(s => s.id === activeId);

  if (!hasLoaded) return <div style={{ background: '#0a0a0a', color: '#4caf50', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>SYNCING...</h2></div>;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#eee', fontFamily: 'Inter, sans-serif' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ color: '#4caf50', margin: 0 }}>GreenStack 2.0 ☁️</h1>
          <nav style={{ display: 'flex', gap: '10px' }}>
            {Object.keys(state.config || {}).map(id => (
              <button key={id} onClick={() => {setView('dashboard'); setActiveBedId(id);}} style={{ padding: '10px 20px', background: activeBedId === id ? '#2e7d32' : '#111', color: '#fff', border: '1px solid #333', cursor: 'pointer' }}>{state.config[id].label}</button>
            ))}
            <button onClick={() => setView('admin')} style={{ padding: '10px 20px', background: view === 'admin' ? '#2e7d32' : '#111', color: '#fff', border: '1px solid #333', cursor: 'pointer' }}>⚙️ Admin</button>
          </nav>
        </header>

        <main style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: '3' }}>
            {view === 'dashboard' ? (
              <GardenGrid label={state.config[activeBedId]?.label} rows={state.config[activeBedId]?.rows} columns={state.config[activeBedId]?.cols} gridData={state.data[activeBedId] || {}} envData={state.env?.[activeBedId] || {}} onRemovePlant={(coord) => {
                const newState = { ...state };
                delete newState.data[activeBedId][coord];
                commitState(newState);
              }} />
            ) : (
              <AdminPanel gardenState={state} setGardenState={commitState} onReset={() => commitState({ config: {}, data: {}, env: {}, seedBank: [], supplies: [] })} />
            )}
          </div>
          <aside style={{ flex: '1' }}>
            <InventoryTable seedBank={state.seedBank} />
          </aside>
        </main>

        <DragOverlay>
          {activeId && activeSeed ? (
            <div style={{ 
              padding: '10px 20px', 
              background: '#1a1a1a', 
              border: '2px solid #4caf50', 
              borderRadius: '8px', 
              color: '#fff', 
              zIndex: 9999, // 🔥 FORCE ON TOP
              pointerEvents: 'none', // 🔥 PREVENT DROP BLOCKING
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
            }}>
              🌱 {activeSeed.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}