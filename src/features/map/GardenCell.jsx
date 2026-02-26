import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function GardenCell({ coord, plant, onRemove, isIslandTop }) {
  const { setNodeRef, isOver } = useDroppable({ id: coord });

  const getPlantIcon = (p) => {
    const name = p.name.toLowerCase();
    if (name.includes('tomato')) return '🍅';
    if (name.includes('pepper')) return '🫑';
    if (name.includes('cucumber') || name.includes('zucchini')) return '🥒';
    if (name.includes('banner') || name.includes('cookies') || name.includes('og')) return '🌿';
    return '🌱';
  };

  const cellStyle = {
    width: '80px',
    height: '80px',
    // Highlight the "Island Top" with a subtle glow or different border
    background: isOver ? '#2e7d32' : (isIslandTop ? '#222' : '#111'),
    border: isIslandTop ? '2px solid #4caf50' : '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    boxShadow: isIslandTop ? 'inset 0 0 10px rgba(76, 175, 80, 0.2)' : 'none'
  };

  return (
    <div ref={setNodeRef} style={cellStyle}>
      {plant ? (
        <>
          <span style={{ fontSize: '28px' }}>{getPlantIcon(plant)}</span>
          <span style={labelStyle}>{plant.name}</span>
          <button onClick={onRemove} style={deleteBtnStyle}>✕</button>
        </>
      ) : (
        <span style={{ color: isIslandTop ? '#4caf50' : '#444', fontSize: '10px' }}>
          {isIslandTop ? 'TOP' : coord}
        </span>
      )}
    </div>
  );
}

const labelStyle = { fontSize: '9px', textAlign: 'center', color: '#81c784', fontWeight: 'bold', marginTop: '4px' };
const deleteBtnStyle = { position: 'absolute', top: '2px', right: '2px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px' };