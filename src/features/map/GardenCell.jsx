import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function GardenCell({ coord, plant, onRemove, isIslandTop }) {
  const { isOver, setNodeRef } = useDroppable({
    id: coord,
  });

  const cellStyle = {
    width: '80px',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: isOver ? '#2e7d32' : '#111',
    border: isIslandTop ? '2px solid #ffeb3b' : '1px solid #333',
    position: 'relative', // 🔥 CRITICAL: Creates a new stacking context
    transition: 'background 0.2s ease',
    fontSize: '10px',
    color: '#444',
  };

  const plantStyle = {
    width: '60px',
    height: '60px',
    background: '#1a1a1a',
    border: '2px solid #4caf50',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'grab',
    position: 'absolute',
    zIndex: 10, // 🔥 CRITICAL: Keeps plant ABOVE the grid lines
    boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
    textAlign: 'center',
    padding: '4px',
    userSelect: 'none'
  };

  const removeBtnStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // 🔥 ABOVE the plant icon
  };

  return (
    <div ref={setNodeRef} style={cellStyle}>
      {!plant && coord}
      {plant && (
        <div style={plantStyle}>
          {onRemove && (
            <button style={removeBtnStyle} onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}>✕</button>
          )}
          <span style={{ fontSize: '18px' }}>🌱</span>
          <div style={{ 
            color: '#fff', 
            fontSize: '9px', 
            fontWeight: 'bold', 
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
          }}>
            {plant.name}
          </div>
        </div>
      )}
    </div>
  );
}