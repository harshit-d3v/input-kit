import { forwardRef, useMemo, useCallback } from 'react';
import type { ReactElement, Ref } from 'react';
import type { ComboboxProps, ComboboxOption, UseComboboxProps } from './types.js';
import { useCombobox } from './useCombobox.js';
import { ComboboxOption as ComboboxOptionComponent } from './ComboboxOption.js';
import { getOptionValue, findOptionIndexByValue, generateId } from './utils.js';

// SVG Icon Components (Lucide-style)
const ChevronUpIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LoaderIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

/**
 * Combobox component
 * A flexible autocomplete/combobox with async loading, multi-select, and creatable options
 */
const ComboboxImpl = forwardRef<HTMLDivElement, ComboboxProps<unknown>>(
  function Combobox(props, ref) {
    const {
      value,
      onChange,
      placeholder = 'Select...',
      disabled = false,
      multi = false,
      creatable = false,
      createLabel,
      clearInputOnSelect,
      renderValue,
      renderOption,
      onInputChange,
      debounceMs,
      loading: externalLoading,
      loadingComponent,
      clearable = false,
      id: idProp,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      className,
      // Static or async options
      options: staticOptions,
      loadOptions,
      filterFn,
    } = props;

    /**
     * `onChange` and `multi` are discriminated on each other in the public type, so
     * on the un-narrowed union `onChange` accepts only the intersection of both
     * parameter types and `multi` is a plain boolean. Both are widened once here and
     * passed on, rather than casting at each use.
     */
    const emit = onChange as (value: unknown | unknown[] | null) => void;

    // Generate unique ID
    const id = useMemo(() => idProp || generateId('combobox'), [idProp]);

    const {
      inputProps,
      inputRef,
      listboxProps,
      listboxRef,
      isOpen,
      highlightedIndex,
      filteredOptions,
      selectOption,
      highlightOption,
      clearSelection,
      inputValue,
      isLoading,
      isSelected,
      getOptionId,
    } = useCombobox({
      options: staticOptions,
      loadOptions,
      value,
      onChange: emit,
      multi,
      creatable,
      createLabel,
      clearInputOnSelect,
      filterFn,
      debounceMs,
      loading: externalLoading,
      onInputChange,
      id,
    } as UseComboboxProps<unknown>);

    // Get selected options for display
    const selectedOptions = useMemo(() => {
      if (value === null) return [];
      
      const values = multi ? (value as unknown[]) : [value];
      const allOptions = staticOptions || filteredOptions;
      
      return values.map(v => {
        const index = findOptionIndexByValue(allOptions, v);
        return index >= 0 ? allOptions[index] : null;
      }).filter((opt): opt is ComboboxOption<unknown> => opt !== null);
    }, [value, multi, staticOptions, filteredOptions]);

    // Handle clear button click
    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      clearSelection();
    }, [clearSelection]);

    // Handle remove tag (multi-select)
    const handleRemoveTag = useCallback((optionValue: unknown, e: React.MouseEvent) => {
      e.stopPropagation();
      if (multi && Array.isArray(value)) {
        const newValue = value.filter(v => v !== optionValue);
        emit(newValue.length > 0 ? newValue : []);
      }
    }, [multi, value, emit]);

    // Render selected value(s)
    const renderSelectedValue = useCallback((option: ComboboxOption<unknown>) => {
      if (renderValue) {
        const optionValue = getOptionValue(option);
        return renderValue(optionValue, option);
      }
      return option.label;
    }, [renderValue]);

    const containerClasses = [
      'combobox',
      isOpen && 'combobox--open',
      disabled && 'combobox--disabled',
      multi && 'combobox--multi',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={containerClasses}
        id={id}
      >
        {/* Input container */}
        <div className="combobox__control">
          {/* Selected values (multi-select chips) */}
          {multi && selectedOptions.length > 0 && (
            <div className="combobox__tags">
              {selectedOptions.map((option) => {
                const optionValue = getOptionValue(option);
                return (
                  <span key={option.id} className="combobox__tag">
                    <span className="combobox__tag-label">
                      {renderSelectedValue(option)}
                    </span>
                    <button
                      type="button"
                      className="combobox__tag-remove"
                      onClick={(e) => handleRemoveTag(optionValue, e)}
                      aria-label={`Remove ${option.label}`}
                      tabIndex={-1}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Input field */}
          <input
            {...inputProps}
            ref={inputRef}
            type="text"
            placeholder={selectedOptions.length === 0 ? placeholder : undefined}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className="combobox__input"
          />

          {/* Clear button */}
          {clearable && (value !== null && (!Array.isArray(value) || value.length > 0)) && (
            <button
              type="button"
              className="combobox__clear"
              onClick={handleClear}
              aria-label="Clear selection"
              tabIndex={-1}
            >
              ×
            </button>
          )}

          {/* Dropdown indicator */}
          <span className="combobox__indicator" aria-hidden="true">
            {isLoading ? <LoaderIcon size={16} /> : isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
          </span>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="combobox__menu">
            {isLoading && loadingComponent ? (
              <div className="combobox__loading">{loadingComponent}</div>
            ) : isLoading ? (
              <div className="combobox__loading">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="combobox__empty">No options</div>
            ) : (
              <ul {...listboxProps} ref={listboxRef} className="combobox__listbox">
                {filteredOptions.map((option, index) => (
                  <ComboboxOptionComponent
                    key={option.id}
                    id={getOptionId(index)}
                    option={option}
                    isHighlighted={index === highlightedIndex}
                    isSelected={isSelected(option)}
                    onClick={() => selectOption(index)}
                    onMouseEnter={() => highlightOption(index)}
                    render={renderOption}
                    inputValue={inputValue}
                    highlightMatches={!renderOption}
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Screen reader only live region for announcements */}
        <div 
          className="combobox__live-region" 
          aria-live="polite" 
          aria-atomic="true"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {isOpen && filteredOptions.length > 0 && (
            `${filteredOptions.length} options available. Use arrow keys to navigate.`
          )}
        </div>
      </div>
    );
  }
);

/**
 * ComboboxProps<T> carries render callbacks that accept ComboboxOption<T>, which
 * makes T invariant: ComboboxOption<string>[] is therefore not assignable to
 * ComboboxOption<unknown>[], and a component fixed at `unknown` can never take
 * typed options. forwardRef has no way to express a generic component, so the
 * implementation stays unknown-typed internally while the exported signature is
 * restated as generic over T.
 */
export const Combobox = ComboboxImpl as <T = unknown>(
  props: ComboboxProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;

export default Combobox;
