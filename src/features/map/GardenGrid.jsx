import React from 'react';
import GardenCell from './GardenCell';

export default function GardenGrid({ label, rows, columns, gridData, onRemovePlant, envData = {} }) {
  const columnLabels = Array.from({ length: columns || 0 }, (_, i) => String.fromCharCode(65 + i));
  const rowLabels = Array.from({ length: rows || 0 }, (_, i) => i + 1);

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `40px repeat(${columns}, 80px)`,
    gap: '2px',
    background: '#333',
    padding: '10px',
    borderRadius: '12px',
    overflowX: 'auto',
    width: 'fit-content',
    backgroundColor: '#000',
    border: '1px solid #2e7d32'
  };

  const headerLabelStyle = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontWeight: 'bold', 
    color: '#fff', 
    height: '80px', 
    backgroundColor: '#111' 
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
        <h2 style={{ color: '#81c784', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
          {label || "Garden Bed"}
        </h2>
        
        {/* ENV HUD */}
        <div style={{ display: 'flex', gap: '20px', background: '#111', padding: '10px 20px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={hudStat}><small style={{color: '#666'}}>pH</small><span style={{color: '#ffeb3b'}}>{envData.ph || '--'}</span></div>
          <div style={hudStat}><small style={{color: '#666'}}>PPM</small><span style={{color: '#03a9f4'}}>{envData.ppm || '--'}</span></div>
          <div style={hudStat}><small style={{color: '#666'}}>PPFD</small><span style={{color: '#f44336'}}>{envData.ppfd || '--'}</span></div>
        </div>
      </div>
      
      <div style={gridContainerStyle}>
        <div /> 
        {columnLabels.map(label => (
          <div key={label} style={headerLabelStyle}>{label}</div>
        ))}
        {rowLabels.map((row, rowIndex) => {
          const isIslandTop = label?.toLowerCase().includes('island') && rowIndex === 1;
          return (
            <React.Fragment key={row}>
              <div style={headerLabelStyle}>{row}</div>
              {columnLabels.map(col => {
                const coord = `${col}${row}`;
                return (
                  <GardenCell
                    key={coord}
                    coord={coord}
                    plant={gridData[coord]}
                    onRemove={() => onRemovePlant && onRemovePlant(coord)}
                    isIslandTop={isIslandTop}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const hudStat = { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px', fontWeight: 'bold' };