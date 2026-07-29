import React, { useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../src/index';

function triggerStyle(disabled = false) {
  return {
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '0.875rem',
    fontWeight: 700,
    opacity: disabled ? 0.5 : 1,
  } as const;
}

export function Demo() {
  const [selectedIndex, setSelectedIndex] = useState(1);

  return (
    <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <h1>@input-kit/tabs</h1>
      <p>Accessible compound tabs with roving focus, keyboard shortcuts, and controlled or uncontrolled state.</p>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Automatic Activation</h2>
        <Tabs>
          <TabList aria-label="Product sections" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
            <Tab style={triggerStyle()}>Overview</Tab>
            <Tab style={triggerStyle()}>API</Tab>
            <Tab style={triggerStyle()}>Roadmap</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>Use the arrow keys to move between triggers. Focus also activates the panel in automatic mode.</p>
            </TabPanel>
            <TabPanel>
              <p>The API stays index-based, so it remains simple to control from parent state.</p>
            </TabPanel>
            <TabPanel>
              <p>Tabs now generate linked ids, proper tabpanel relationships, and roving tabIndex behavior.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Manual Activation With Disabled Tab</h2>
        <Tabs selectedIndex={selectedIndex} onChange={setSelectedIndex} activationMode="manual">
          <TabList aria-label="Release checklist" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
            <Tab style={triggerStyle()}>Design</Tab>
            <Tab style={triggerStyle()}>Build</Tab>
            <Tab disabled style={triggerStyle(true)}>QA Locked</Tab>
            <Tab style={triggerStyle()}>Ship</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>Manual activation waits for Enter or Space before changing the panel.</p>
            </TabPanel>
            <TabPanel>
              <p>Selected step: {selectedIndex + 1}. This mode works well for data-heavy panels where focus should not immediately swap content.</p>
            </TabPanel>
            <TabPanel forceMount>
              <p>This panel is force-mounted, but its trigger is disabled.</p>
            </TabPanel>
            <TabPanel>
              <p>Controlled tabs make wizard and settings flows straightforward.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </section>

      <section style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Vertical Layout</h2>
        <Tabs orientation="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem' }}>
            <TabList aria-label="Workspace views" style={{ gap: '0.5rem' }}>
              <Tab style={triggerStyle()}>Files</Tab>
              <Tab style={triggerStyle()}>Commits</Tab>
              <Tab style={triggerStyle()}>Deploys</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <p>Vertical mode switches arrow-key behavior to Up and Down, matching the layout direction.</p>
              </TabPanel>
              <TabPanel>
                <p>The same primitives work for sidebars, inspectors, and settings panes.</p>
              </TabPanel>
              <TabPanel>
                <p>Each panel receives proper aria-labelledby wiring and can be force-mounted when needed.</p>
              </TabPanel>
            </TabPanels>
          </div>
        </Tabs>
      </section>
    </div>
  );
}

export default Demo;
