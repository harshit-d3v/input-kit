import { forwardRef, useMemo } from 'react';
import type { ComboboxOptionProps, ComboboxOption as ComboboxOptionType } from './types.js';
import { highlightMatch } from './utils.js';

// SVG Icon Component (Lucide-style)
const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface ComboboxOptionComponentProps<T = unknown> extends ComboboxOptionProps<T> {
  /** Input value for highlighting matches */
  inputValue?: string;
  /** Whether to highlight matching text */
  highlightMatches?: boolean;
}

/**
 * Default render function for an option
 */
function defaultRenderOption<T>(
  option: ComboboxOptionType<T>,
  _isHighlighted: boolean,
  isSelected: boolean,
  inputValue: string,
  highlightMatches: boolean
): React.ReactNode {
  const content = highlightMatches && inputValue
    ? renderHighlightedLabel(option.label, inputValue)
    : option.label;

  return (
    <>
      <span className="combobox-option__label">{content}</span>
      {isSelected && (
        <span className="combobox-option__check" aria-hidden="true">
          <CheckIcon size={14} />
        </span>
      )}
    </>
  );
}

/**
 * Render label with highlighted matches
 */
function renderHighlightedLabel(label: string, inputValue: string): React.ReactNode {
  const matches = highlightMatch(label, inputValue);
  
  return matches.map((match, index) => (
    match.isMatch ? (
      <mark key={index} className="combobox-option__highlight">
        {match.text}
      </mark>
    ) : (
      <span key={index}>{match.text}</span>
    )
  ));
}

/**
 * ComboboxOption component
 * Renders a single option in the combobox dropdown
 */
export const ComboboxOption = forwardRef<HTMLLIElement, ComboboxOptionComponentProps<unknown>>(
  function ComboboxOptionComponent(props, ref) {
    const {
      option,
      isHighlighted,
      isSelected,
      onClick,
      onMouseEnter,
      render,
      id,
      role = 'option',
      'aria-selected': ariaSelected,
      inputValue = '',
      highlightMatches = true,
    } = props;

    const content = useMemo(() => {
      if (render) {
        return render(option, isHighlighted, isSelected);
      }
      return defaultRenderOption(option, isHighlighted, isSelected, inputValue, highlightMatches);
    }, [option, isHighlighted, isSelected, render, inputValue, highlightMatches]);

    return (
      <li
        ref={ref}
        id={id}
        role={role}
        aria-selected={ariaSelected ?? isSelected}
        aria-disabled={option.disabled}
        onClick={option.disabled ? undefined : onClick}
        onMouseEnter={option.disabled ? undefined : onMouseEnter}
        className={[
          'combobox-option',
          isHighlighted && 'combobox-option--highlighted',
          isSelected && 'combobox-option--selected',
          option.disabled && 'combobox-option--disabled',
        ].filter(Boolean).join(' ')}
        data-value={option.id}
      >
        {content}
      </li>
    );
  }
);

export default ComboboxOption;
