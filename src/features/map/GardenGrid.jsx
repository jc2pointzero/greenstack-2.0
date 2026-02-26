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
    border: '2px solid #2e7d32'
  };

  const headerLabelStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff', height: '80px', backgroundColor: '#111' };

  const statGroup = (label, value, color) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
      <small style={{ color: '#666', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</small>
      <span style={{ color: color, fontWeight: 'bold', fontSize: '14px' }}>{value || '--'}</span>
    </div>
  );

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#81c784', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '20px' }}>{label || "Garden Bed"}</h2>
          <small style={{ color: '#444', fontSize: '10px' }}>LAST SYNC: {envData.lastUpdated || 'NO DATA'}</small>
        </div>
        <div style={{ display: 'flex', gap: '15px', background: '#111', padding: '12px 20px', borderRadius: '10px', border: '1px solid #333' }}>
          {statGroup('pH', envData.ph, '#ffeb3b')}
          {statGroup('PPM', envData.ppm, '#03a9f4')}
          {statGroup('PPFD', envData.ppfd, '#f44336')}
          {(envData.temp || envData.humidity) && <div style={{ width: '1px', background: '#333', margin: '0 5px' }} />}
          {envData.temp && statGroup('TEMP', `${envData.temp}°F`, '#ff9800')}
          {envData.humidity && statGroup('RH', `${envData.humidity}%`, '#4caf50')}
        </div>
      </div>
      <div style={gridContainerStyle}>
        <div /> 
        {columnLabels.map(label => (<div key={label} style={headerLabelStyle}>{label}</div>))}
        {rowLabels.map((row, rowIndex) => {
          const isIslandTop = label?.toLowerCase().includes('island') && rowIndex === 1;
          return (
            <React.Fragment key={row}>
              <div style={headerLabelStyle}>{row}</div>
              {columnLabels.map(col => {
                const coord = `${col}${row}`;
                return (<GardenCell key={coord} coord={coord} plant={gridData[coord]} onRemove={() => onRemovePlant && onRemovePlant(coord)} isIslandTop={isIslandTop} />);
              })}
            </React.Fragment>
          );
        }) }
      </div>
    </div>
  );
}