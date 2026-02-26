import React, { useState } from 'react';

export default function AdminPanel({ gardenState, setGardenState, onReset }) {
  const [activeTab, setActiveTab] = useState('Grids');
  const [importJson, setImportJson] = useState('');
  const [newGrid, setNewGrid] = useState({ name: '', rows: 15, cols: 9 });

  // Supply Management
  const [newSupply, setNewSupply] = useState({ item: '', qty: '' });

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      const incomingSeeds = Array.isArray(parsed) ? parsed : (parsed.seedBank || []);
      setGardenState({ ...gardenState, seedBank: incomingSeeds });
      setImportJson('');
      alert("Seeds Imported!");
    } catch (e) { alert("Invalid JSON"); }
  };

  const updateEnv = (gridId, field, value) => {
    const newState = { ...gardenState };
    if (!newState.env) newState.env = {};
    if (!newState.env[gridId]) newState.env[gridId] = {};
    
    newState.env[gridId][field] = value;
    newState.env[gridId].lastUpdated = new Date().toLocaleString(); // Timestamping the reading
    setGardenState(newState);
  };

  const addGrid = () => {
    if (!newGrid.name) return;
    const id = `grid-${Date.now()}`;
    setGardenState({
      ...gardenState,
      config: { ...gardenState.config, [id]: { label: newGrid.name, rows: parseInt(newGrid.rows), cols: parseInt(newGrid.cols) } },
      data: { ...gardenState.data, [id]: {} }
    });
    setNewGrid({ name: '', rows: 15, cols: 9 });
  };

  return (
    <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px', overflowX: 'auto' }}>
        {['Grids', 'Environment', 'Seeds', 'Supplies', 'System'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            style={{ 
              padding: '10px 20px', 
              cursor: 'pointer', 
              border: 'none', 
              borderRadius: '4px', 
              background: activeTab === t ? '#2e7d32' : '#333', 
              color: '#fff',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Environment' && (
        <div>
          <h3 style={{ color: '#81c784' }}>Smyrna HQ Environmental Logs</h3>
          {Object.keys(gardenState.config || {}).map(id => (
            <div key={id} style={{ marginBottom: '20px', padding: '15px', background: '#222', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{gardenState.config[id].label}</h4>
                <small style={{ color: '#666' }}>Last updated: {gardenState.env?.[id]?.lastUpdated || 'Never'}</small>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={logGroup}><label>pH</label><input type="number" step="0.1" value={gardenState.env?.[id]?.ph || ''} onChange={e => updateEnv(id, 'ph', e.target.value)} style={inputStyle} /></div>
                <div style={logGroup}><label>PPM</label><input type="number" value={gardenState.env?.[id]?.ppm || ''} onChange={e => updateEnv(id, 'ppm', e.target.value)} style={inputStyle} /></div>
                <div style={logGroup}><label>PPFD</label><input type="number" value={gardenState.env?.[id]?.ppfd || ''} onChange={e => updateEnv(id, 'ppfd', e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Grids' && (
        <div>
          <h3 style={{ color: '#81c784' }}>Garden Bed Config</h3>
          <div style={inputContainer}>
            <input placeholder="Bed Name" value={newGrid.name} onChange={e => setNewGrid({ ...newGrid, name: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="R" value={newGrid.rows} onChange={e => setNewGrid({ ...newGrid, rows: e.target.value })} style={{ width: '60px', ...inputStyle }} />
            <input type="number" placeholder="C" value={newGrid.cols} onChange={e => setNewGrid({ ...newGrid, cols: e.target.value })} style={{ width: '60px', ...inputStyle }} />
            <button onClick={addGrid} style={actionBtnStyle}>Add Bed</button>
          </div>
          {Object.keys(gardenState.config || {}).map(id => (
            <div key={id} style={listRow}>
              <span><strong>{gardenState.config[id].label}</strong> ({gardenState.config[id].rows}x{gardenState.config[id].cols})</span>
              <button onClick={() => {
                const nc = { ...gardenState.config }; delete nc[id];
                const nd = { ...gardenState.data }; delete nd[id];
                setGardenState({ ...gardenState, config: nc, data: nd });
              }} style={deleteBtn}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Seeds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#81c784' }}>Seed Vault Management</h3>
          <textarea value={importJson} onChange={e => setImportJson(e.target.value)} style={textareaStyle} placeholder="Paste JSON here..." />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleImport} style={actionBtnStyle}>Import JSON</button>
            <button onClick={() => setGardenState({ ...gardenState, seedBank: [] })} style={{ ...actionBtnStyle, background: '#d32f2f' }}>Purge Vault</button>
          </div>
        </div>
      )}

      {activeTab === 'Supplies' && (
        <div>
          <h3 style={{ color: '#81c784' }}>Inventory & Equipment</h3>
          <div style={inputContainer}>
            <input placeholder="Item" value={newSupply.item} onChange={e => setNewSupply({ ...newSupply, item: e.target.value })} style={inputStyle} />
            <input placeholder="Qty" value={newSupply.qty} onChange={e => setNewSupply({ ...newSupply, qty: e.target.value })} style={{ width: '80px', ...inputStyle }} />
            <button onClick={() => {
              if (!newSupply.item) return;
              const updatedSupplies = [...(gardenState.supplies || []), { ...newSupply, id: Date.now() }];
              setGardenState({ ...gardenState, supplies: updatedSupplies });
              setNewSupply({ item: '', qty: '' });
            }} style={actionBtnStyle}>Add Item</button>
          </div>
          {gardenState.supplies?.map(s => (
            <div key={s.id} style={listRow}>
              <span>{s.item} <small style={{color: '#888'}}>({s.qty})</small></span>
              <button onClick={() => {
                const updated = gardenState.supplies.filter(sup => sup.id !== s.id);
                setGardenState({ ...gardenState, supplies: updated });
              }} style={deleteBtn}>✕</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'System' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <button onClick={onReset} style={nukeBtn}>EXECUTE BLANK SLATE PROTOCOL</button>
        </div>
      )}
    </div>
  );
}

const logGroup = { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 };
const inputContainer = { display: 'flex', gap: '10px', marginBottom: '20px', background: '#222', padding: '15px', borderRadius: '8px' };
const inputStyle = { background: '#000', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' };
const actionBtnStyle = { background: '#2e7d32', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const listRow = { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #333' };
const deleteBtn = { background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer' };
const textareaStyle = { height: '200px', background: '#000', color: '#0f0', border: '1px solid #444', padding: '10px', fontFamily: 'monospace' };
const nukeBtn = { background: '#d32f2f', color: '#fff', padding: '20px 40px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };