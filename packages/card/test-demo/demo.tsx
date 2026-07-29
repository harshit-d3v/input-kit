import React, { useState } from 'react';
import {
  CardInput,
  ExpiryInput,
  CvvInput,
  useCardInput,
  luhnCheck,
  detectCardType,
  maskCardNumber,
  getCardInfo,
} from '../src/index';

const sectionStyle: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const errorStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#dc2626',
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
  background: color,
  color: '#fff',
});

// ─── Section 1: Individual components, uncontrolled ──────────────────────────
function IndividualComponentsDemo() {
  const [cardNum, setCardNum] = useState('');
  const [cardType, setCardType] = useState('unknown');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [masked, setMasked] = useState(false);

  const info = getCardInfo(cardType as any);

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Individual Components</h2>
      <div style={rowStyle}>
        <div style={{ ...fieldStyle, flex: '1 1 260px' }}>
          <label style={labelStyle}>Card Number</label>
          <CardInput
            value={cardNum}
            onChange={(v, t) => { setCardNum(v); setCardType(t); }}
            masked={masked}
            showIcon={true}
            style={{ width: '100%' }}
          />
          <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={badgeStyle('#6366f1')}>{info.name}</span>
            {cardNum.length > 0 && (
              <span style={badgeStyle(luhnCheck(cardNum) ? '#16a34a' : '#dc2626')}>
                {luhnCheck(cardNum) ? 'Luhn ✓' : 'Luhn ✗'}
              </span>
            )}
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Expiry</label>
          <ExpiryInput value={expiry} onChange={setExpiry} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>CVV</label>
          <CvvInput value={cvv} onChange={setCvv} cardType={cardType as any} />
        </div>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={masked}
            onChange={(e) => setMasked(e.target.checked)}
            style={{ marginRight: '6px' }}
          />
          Mask card number when blurred
        </label>
      </div>
      {masked && cardNum && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
          Masked: <code>{maskCardNumber(cardNum)}</code>
        </p>
      )}
    </div>
  );
}

// ─── Section 2: useCardInput hook — full form with validation ─────────────────
function HookFormDemo() {
  const {
    cardNumberFormatted,
    cardType,
    expiryDate,
    cvv,
    cardholderName,
    isValid,
    errors,
    setCardNumber,
    setExpiryDate,
    setCvv,
    setCardholderName,
    validate,
    reset,
  } = useCardInput();

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 1rem' }}>useCardInput Hook — Full Form</h2>
        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
          <strong style={{ color: '#16a34a' }}>Payment submitted!</strong>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#374151' }}>
            Card: {cardNumberFormatted} ({cardType}) | Expiry: {expiryDate} | Holder: {cardholderName}
          </p>
        </div>
        <button
          onClick={() => { reset(); setSubmitted(false); }}
          style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>useCardInput Hook — Full Form</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Cardholder Name</label>
            <input
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Smith"
              aria-label="Cardholder name"
              style={{ padding: '8px 12px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '4px', width: '320px' }}
            />
            {errors.cardholderName && <span style={errorStyle}>{errors.cardholderName}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Card Number</label>
            <CardInput
              value={cardNumberFormatted.replace(/\s/g, '')}
              onChange={(v) => setCardNumber(v)}
              showIcon={true}
              style={{ width: '320px' }}
            />
            {errors.cardNumber && <span style={errorStyle}>{errors.cardNumber}</span>}
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Expiry</label>
              <ExpiryInput value={expiryDate} onChange={setExpiryDate} />
              {errors.expiryDate && <span style={errorStyle}>{errors.expiryDate}</span>}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>CVV</label>
              <CvvInput value={cvv} onChange={setCvv} cardType={cardType} />
              {errors.cvv && <span style={errorStyle}>{errors.cvv}</span>}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '9px 20px',
              background: isValid ? '#4f46e5' : '#818cf8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Pay Now
          </button>
          <button
            type="button"
            onClick={reset}
            style={{ padding: '9px 16px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
          >
            Clear
          </button>
          <span style={badgeStyle(isValid ? '#16a34a' : '#9ca3af')}>
            {isValid ? 'Valid' : 'Incomplete'}
          </span>
        </div>
      </form>
    </div>
  );
}

// ─── Section 3: Card type detection showcase ─────────────────────────────────
const TEST_CARDS: { label: string; number: string }[] = [
  { label: 'Visa', number: '4111111111111111' },
  { label: 'Mastercard', number: '5500005555555559' },
  { label: 'Amex', number: '378282246310005' },
  { label: 'Discover', number: '6011111111111117' },
  { label: 'Diners', number: '30569309025904' },
  { label: 'JCB', number: '3530111333300000' },
  { label: 'UnionPay', number: '6212341234567890' },
];

function CardTypeShowcase() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div style={sectionStyle}>
      <h2 style={{ margin: '0 0 1rem' }}>Card Type Detection</h2>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
        Click a card to load it into the input.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {TEST_CARDS.map(({ label, number }) => (
          <button
            key={label}
            onClick={() => setActive(number)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `2px solid ${active === number ? '#4f46e5' : '#e5e7eb'}`,
              background: active === number ? '#eef2ff' : '#f9fafb',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {active && (
        <div>
          <CardInput
            value={active}
            onChange={() => {}}
            showIcon={true}
            style={{ width: '320px' }}
          />
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
            Detected: <strong>{detectCardType(active)}</strong> |
            Luhn: <strong style={{ color: luhnCheck(active) ? '#16a34a' : '#dc2626' }}>
              {luhnCheck(active) ? 'valid' : 'invalid'}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Root Demo ────────────────────────────────────────────────────────────────
export function Demo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <h1 style={{ margin: '0 0 4px' }}>@input-kit/card</h1>
      <p style={{ margin: '0 0 8px', color: '#6b7280' }}>
        Headless credit card input — auto-detection, formatting, Luhn validation
      </p>
      <IndividualComponentsDemo />
      <HookFormDemo />
      <CardTypeShowcase />
    </div>
  );
}

export default Demo;
