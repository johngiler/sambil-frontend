"use client";

import Select, { components as selectComponents } from "react-select";

const menuPortal = { menuPortal: (base) => ({ ...base, zIndex: 8000 }) };

function AdminSelectOption(props) {
  const { data, children } = props;
  const reason = typeof data?.disabledReason === "string" ? data.disabledReason.trim() : "";
  const title = data?.isDisabled && reason ? reason : undefined;
  return (
    <selectComponents.Option {...props}>
      <span title={title}>{children}</span>
    </selectComponents.Option>
  );
}

/**
 * Select con estilo admin (react-select).
 * @param {{ v: string|number, l: string }[]} options
 * @param {boolean} [props.defaultMenuIsOpen] — abre el menú al montar (p. ej. panel flotante en tabla).
 */
export function AdminSelect({
  id,
  inputId,
  options,
  value,
  onChange,
  isDisabled,
  placeholder = "Seleccionar…",
  className,
  "aria-label": ariaLabel,
  inModal = false,
  compact = false,
  isClearable = false,
  isSearchable: isSearchableProp,
  defaultMenuIsOpen = false,
}) {
  const mapped = options.map((o) => ({
    value: o.v,
    label: o.l,
    isDisabled: Boolean(o.disabled),
    disabledReason: typeof o.disabledReason === "string" ? o.disabledReason : "",
  }));
  const emptyOption = mapped.find((x) => String(x.value) === "");
  const selected =
    value === "" || value === null || value === undefined
      ? (emptyOption ?? null)
      : (mapped.find((x) => String(x.value) === String(value)) ?? null);

  const isSearchable =
    isSearchableProp !== undefined ? isSearchableProp : mapped.length > 8;

  const r = inModal ? 10 : 15;
  const minH = compact ? 34 : 40;
  const focusBorder = "color-mix(in srgb, var(--mp-primary) 50%, #d4d4d8)";
  const focusRing = "0 0 0 2px color-mix(in srgb, var(--mp-primary) 15%, transparent)";
  const optionSelectedBg = "var(--mp-primary)";
  const optionFocusedBg = "color-mix(in srgb, var(--mp-primary) 6%, #f4f4f5)";

  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: minH,
      borderRadius: r,
      borderColor: state.isFocused ? focusBorder : "#e4e4e7",
      boxShadow: state.isFocused ? focusRing : "none",
      fontSize: compact ? "0.8125rem" : "0.875rem",
      backgroundColor: isDisabled ? "#f4f4f5" : "#fff",
      cursor: isDisabled ? "not-allowed" : "default",
    }),
    valueContainer: (b) => ({
      ...b,
      padding: compact ? "0 6px" : "0 10px",
    }),
    menu: (b) => ({
      ...b,
      borderRadius: r,
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(15, 23, 42, 0.12)",
      border: "1px solid #e4e4e7",
    }),
    menuList: (b) => ({ ...b, padding: 4 }),
    option: (b, state) => ({
      ...b,
      borderRadius: Math.max(0, r - 4),
      fontSize: compact ? "0.8125rem" : "0.875rem",
      backgroundColor: state.isSelected
        ? optionSelectedBg
        : state.isFocused
          ? optionFocusedBg
          : "#fff",
      color: state.isSelected ? "#fff" : "#18181b",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      opacity: state.isDisabled ? 0.55 : 1,
    }),
    singleValue: (b) => ({ ...b, color: "#18181b" }),
    placeholder: (b) => ({ ...b, color: "#71717a" }),
    input: (b) => ({ ...b, color: "#18181b" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (b, state) => ({
      ...b,
      color: state.isFocused ? "var(--mp-primary)" : "#71717a",
      padding: compact ? 4 : 6,
    }),
    ...menuPortal,
  };

  return (
    <div className={className}>
      <Select
        inputId={inputId ?? id}
        instanceId={id}
        classNamePrefix="admin-rs"
        components={{ Option: AdminSelectOption }}
        options={mapped}
        value={selected}
        onChange={(opt) => onChange(opt != null ? opt.value : "")}
        isOptionDisabled={(opt) => Boolean(opt?.isDisabled)}
        isDisabled={isDisabled}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        defaultMenuIsOpen={defaultMenuIsOpen}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={styles}
        aria-label={ariaLabel}
      />
    </div>
  );
}
