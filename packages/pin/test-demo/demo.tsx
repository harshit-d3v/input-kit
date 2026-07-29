/**
 * Demo/Test file for @input-kit/pin
 * 
 * This file demonstrates how to use the PIN input component
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState, useRef } from 'react';
import { PinInput, OtpInput, usePinInput } from '../src/index';
import type { PinInputRef, OtpInputRef } from '../src/index';

// Demo 1: Basic PIN Input
function BasicExample() {
  const [pin, setPin] = useState('');

  return (
    <div>
      <h3>Basic PIN Input (4 digits)</h3>
      <PinInput
        length={4}
        value={pin}
        onChange={setPin}
        onComplete={(code) => console.log('PIN complete:', code)}
      />
      <p style={{ marginTop: '10px' }}>PIN: {pin || '-'}</p>
    </div>
  );
}

// Demo 2: Masked PIN Input
function MaskedExample() {
  const [pin, setPin] = useState('');

  return (
    <div>
      <h3>Masked PIN Input</h3>
      <PinInput
        length={4}
        value={pin}
        onChange={setPin}
        mask
        onComplete={(code) => alert(`PIN entered: ${code}`)}
      />
      <p style={{ marginTop: '10px' }}>PIN: {pin || '-'}</p>
    </div>
  );
}

// Demo 3: OTP Input (6 digits)
function OtpExample() {
  const [otp, setOtp] = useState('');

  return (
    <div>
      <h3>OTP Input (6 digits, alphanumeric)</h3>
      <OtpInput
        length={6}
        value={otp}
        onChange={setOtp}
        onComplete={(code) => console.log('OTP complete:', code)}
      />
      <p style={{ marginTop: '10px' }}>OTP: {otp || '-'}</p>
    </div>
  );
}

// Demo 4: Custom Validation
function ValidationExample() {
  const [pin, setPin] = useState('');
  
  // Only allow even numbers
  const validateEvenOnly = (char: string) => {
    const num = parseInt(char, 10);
    return !isNaN(num) && num % 2 === 0;
  };

  return (
    <div>
      <h3>Custom Validation (Even Numbers Only)</h3>
      <PinInput
        length={4}
        value={pin}
        onChange={setPin}
        validate={validateEvenOnly}
        placeholder="0"
      />
      <p style={{ marginTop: '10px' }}>PIN (even digits only): {pin || '-'}</p>
    </div>
  );
}

// Demo 5: Using the Hook (Custom UI)
function HookExample() {
  const { values, handlers, inputRefs, clear, isComplete } = usePinInput({
    length: 4,
    onChange: (value) => console.log('Value changed:', value),
    onComplete: (value) => console.log('Complete:', value),
  });

  return (
    <div>
      <h3>Custom UI with Hook</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {values.map((char, index) => (
          <input
            key={index}
            ref={(el) => {
              if (inputRefs.current) inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            value={char}
            onChange={(e) => handlers.onChange(index, e)}
            onKeyDown={(e) => handlers.onKeyDown(index, e)}
            onPaste={(e) => handlers.onPaste(index, e)}
            onFocus={(e) => handlers.onFocus(index, e)}
            style={{
              width: '60px',
              height: '60px',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              background: char ? '#eff6ff' : '#fff',
            }}
          />
        ))}
        <button
          onClick={clear}
          style={{
            padding: '10px 20px',
            marginLeft: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>
      <p style={{ marginTop: '10px' }}>
        Value: {values.join('') || '-'} | Complete: {isComplete ? 'Yes' : 'No'}
      </p>
    </div>
  );
}

// Demo 6: Ref Methods
function RefExample() {
  const [pin, setPin] = useState('');
  const pinRef = useRef<PinInputRef>(null);

  return (
    <div>
      <h3>Ref Methods (Imperative API)</h3>
      <PinInput
        ref={pinRef}
        length={4}
        value={pin}
        onChange={setPin}
      />
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={() => pinRef.current?.focus(0)}>Focus First</button>
        <button onClick={() => pinRef.current?.focus(3)}>Focus Last</button>
        <button onClick={() => pinRef.current?.clear()}>Clear</button>
      </div>
      <p style={{ marginTop: '10px' }}>PIN: {pin || '-'}</p>
    </div>
  );
}

// Demo 7: Auto Focus
function AutoFocusExample() {
  const [pin, setPin] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div>
      <h3>Auto Focus on Mount</h3>
      <button onClick={() => setShowInput(!showInput)} style={{ marginBottom: '10px' }}>
        {showInput ? 'Hide' : 'Show'} PIN Input
      </button>
      {showInput && (
        <PinInput
          length={4}
          value={pin}
          onChange={setPin}
          autoFocus
        />
      )}
      <p style={{ marginTop: '10px' }}>PIN: {pin || '-'}</p>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/pin Demo</h1>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <MaskedExample />
      <hr style={{ margin: '30px 0' }} />
      
      <OtpExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ValidationExample />
      <hr style={{ margin: '30px 0' }} />
      
      <HookExample />
      <hr style={{ margin: '30px 0' }} />
      
      <RefExample />
      <hr style={{ margin: '30px 0' }} />
      
      <AutoFocusExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, MaskedExample, OtpExample, ValidationExample, HookExample, RefExample, AutoFocusExample };

// Default export
export default DemoApp;
