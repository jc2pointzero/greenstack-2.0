import React, { useState, useEffect } from 'react';

// Sub-component for individual fields to ensure stable rendering and focus
function EnvField({ label, value, onChange, onSave }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 80px' }}>
            <label style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase' }}>{label}</label>
            <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                onBlur={onSave}
                style={{ background: '#000', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }} 
            />
        </div>
    );
}

export default function AdminPanel({ gardenState, setGardenState, onReset }) {
  const [activeTab, setActiveTab] = useState('Grids');
  const [importJson, setImportJson] = useState('');
  const [newGrid, setNewGrid] = useState({ name: '', rows: 3, cols: 4 });
  
  const [localEnv, setLocalEnv] = useState({});

  useEffect(() => {
    if (gardenState.env) {
      setLocalEnv(gardenState.env);
    }
  }, [activeTab, gardenState.env]);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      const incomingSeeds = Array.isArray(parsed) ? parsed : (parsed.seedBank || []);
      setGardenState({ ...gardenState, seedBank: incomingSeeds });
      setImportJson('');
      alert("Seed Bank Successfully Restored!");
    } catch (e) { alert("Invalid JSON format"); }
  };

  const updateLocalField = (gridId, field, value) => {
    setLocalEnv(prev => ({
      ...prev,
      [gridId]: {
        ...(prev[gridId] || {}),
        [field]: value
      }
    }));
  };

  const saveToFirebase = (gridId) => {
    const newState = { ...gardenState };
    if (!newState.env) newState.env = {};
    newState.env[gridId] = {
        ...(localEnv[gridId] || {}),
        lastUpdated: new Date().toLocaleString()
    };
    setGardenState(newState);
  };

  const inputContainer = { display: 'flex', gap: '10px', marginBottom: '20px', background: '#222', padding: '15px', borderRadius: '8px' };
  const inputStyle = { background: '#000', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' };
  const actionBtnStyle = { background: '#2e7d32', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
  const listRow = { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #333' };
  const textareaStyle = { height: '150px', background: '#000', color: '#0f0', border: '1px solid #444', padding: '10px', fontFamily: 'monospace', width: '100%' };

  return (
    <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        {['Grids', 'Environment', 'Seeds', 'System'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} 
            style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: activeTab === t ? '#2e7d32' : '#333', color: '#fff', fontWeight: 'bold' }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Environment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(gardenState.config || {})
            .sort(([idA], [idB]) => idA.localeCompare(idB)) 
            .map(([id, config]) => (
            <div key={`env-container-${id}`} style={{ padding: '15px', background: '#222', borderRadius: '8px', border: '1px solid #444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#81c784' }}>{config.label}</h4>
                <small style={{ color: '#555' }}>ID: {id}</small>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                <EnvField label="pH" value={localEnv[id]?.ph} onChange={(val) => updateLocalField(id, 'ph', val)} onSave={() => saveToFirebase(id)} />
                <EnvField label="PPM" value={localEnv[id]?.ppm} onChange={(val) => updateLocalField(id, 'ppm', val)} onSave={() => saveToFirebase(id)} />
                <EnvField label="PPFD" value={localEnv[id]?.ppfd} onChange={(val) => updateLocalField(id, 'ppfd', val)} onSave={() => saveToFirebase(id)} />
                <EnvField label="Temp" value={localEnv[id]?.temp} onChange={(val) => updateLocalField(id, 'temp', val)} onSave={() => saveToFirebase(id)} />
                <EnvField label="RH%" value={localEnv[id]?.humidity} onChange={(val) => updateLocalField(id, 'humidity', val)} onSave={() => saveToFirebase(id)} />
              </div>
              <div style={{marginTop: '10px', fontSize: '10px', color: '#444'}}>
                Last Logged: {gardenState.env?.[id]?.lastUpdated || 'None'}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Grids' && (
        <div>
          <h3 style={{ color: '#81c784' }}>Garden Configuration</h3>
          <div style={inputContainer}>
            <input placeholder="Bed Name" value={newGrid.name} onChange={e => setNewGrid({ ...newGrid, name: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Rows" value={newGrid.rows} onChange={e => setNewGrid({ ...newGrid, rows: e.target.value })} style={{ width: '80px', ...inputStyle }} />
            <input type="number" placeholder="Cols" value={newGrid.cols} onChange={e => setNewGrid({ ...newGrid, cols: e.target.value })} style={{ width: '80px', ...inputStyle }} />
            <button onClick={() => {
              if(!newGrid.name) return;
              const id = `grid-${Date.now()}`;
              setGardenState({
                ...gardenState,
                config: { ...gardenState.config, [id]: { label: newGrid.name, rows: parseInt(newGrid.rows), cols: parseInt(newGrid.cols) } },
                data: { ...gardenState.data, [id]: {} }
              });
              setNewGrid({ name: '', rows: 3, cols: 4 });
            }} style={actionBtnStyle}>Add Bed</button>
          </div>
          {Object.entries(gardenState.config || {}).map(([id, cfg]) => (
            <div key={id} style={listRow}>
              <span><strong>{cfg.label}</strong> ({cfg.rows}x{cfg.cols})</span>
              <button onClick={() => {
                const nc = { ...gardenState.config }; delete nc[id];
                const nd = { ...gardenState.data }; delete nd[id];
                const ne = { ...gardenState.env }; delete ne[id];
                setGardenState({ ...gardenState, config: nc, data: nd, env: ne });
              }} style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Seeds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#81c784' }}>Master Vault Import</h3>
          <textarea value={importJson} onChange={e => setImportJson(e.target.value)} style={textareaStyle} placeholder="Paste JSON here..." />
          <button onClick={handleImport} style={actionBtnStyle}>Sync Vault</button>
        </div>
      )}

      {activeTab === 'System' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <button onClick={onReset} style={{ background: '#d32f2f', color: '#fff', padding: '20px 40px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>EXECUTE BLANK SLATE PROTOCOL</button>
        </div>
      )}
    </div>
  );
}