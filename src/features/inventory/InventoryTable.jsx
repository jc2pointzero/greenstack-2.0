import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableSeed = ({ seed }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: seed.id,
  });

  const style = {
    padding: '12px',
    margin: '8px 0',
    background: '#fff',
    border: isDragging ? '2px solid #2e7d32' : '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'grab',
    opacity: isDragging ? 0.4 : 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontWeight: 'bold', color: '#1b5e20', fontSize: '14px' }}>{seed.name}</div>
      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>{seed.type}</div>
    </div>
  );
};

export default function InventoryTable({ seedBank = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSeeds = (seedBank || []).filter(seed => {
    const search = searchTerm.toLowerCase();
    return seed.name.toLowerCase().includes(search) || seed.type.toLowerCase().includes(search);
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1b5e20' }}>Seed Vault</h3>
        <input 
          type="text" 
          placeholder="Search genetics..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>
      <div style={{ overflowY: 'auto', flexGrow: 1, padding: '5px' }}>
        {filteredSeeds.map(seed => (
          <DraggableSeed key={seed.id} seed={seed} />
        ))}
      </div>
    </div>
  );
}

const containerStyle = { background: '#f5f5f5', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', height: '80vh', display: 'flex', flexDirection: 'column' };
const headerStyle = { position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1, paddingBottom: '10px' };
const searchInputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' };