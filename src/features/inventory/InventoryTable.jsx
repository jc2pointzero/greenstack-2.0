import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableSeed({ seed }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: seed.id,
  });

  const style = {
    padding: '10px',
    margin: '5px 0',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '6px',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px'
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <span style={{ fontSize: '16px' }}>🌱</span>
      {seed.name}
    </div>
  );
}

export default function InventoryTable({ seedBank }) {
  return (
    <div style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4caf50', fontSize: '14px', textTransform: 'uppercase' }}>Seed Vault</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {seedBank.map((seed) => (
          <DraggableSeed key={seed.id} seed={seed} />
        ))}
        {seedBank.length === 0 && <small style={{ color: '#444' }}>No seeds in vault...</small>}
      </div>
    </div>
  );
}