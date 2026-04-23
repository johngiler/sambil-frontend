const ic = "h-[1.125rem] w-[1.125rem]";

export function IconRowChevron({ className = "" }) {
  return (
    <svg className={`${ic} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRowView({ className = "" }) {
  return (
    <svg className={`${ic} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRowEdit({ className = "" }) {
  return (
    <svg className={`${ic} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRowTrash({ className = "" }) {
  return (
    <svg className={`${ic} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Añadir fila (trazo algo más grueso para legibilidad en botones compactos). */
export function IconRowPlus({ className = "" }) {
  return (
    <svg className={`h-6 w-6 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5v15m7.5-7.5h-15"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Enviar / confirmar (avión de papel, outline). */
export function IconRowPaperAirplane({ className = "" }) {
  return (
    <svg className={`${ic} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12 3.269 3.126A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.876L5.999 12zm6 0h8.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBuildingSection({ className = "" }) {
  return (
    <svg className={`h-8 w-8 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.75 21V6.75A2.25 2.25 0 016 4.5h4.5A2.25 2.25 0 0112.75 6.75V21M3.75 21h16.5M9 6.75h.01M9 9h.01M9 11.25h.01M12 6.75h.01M12 9h.01M12 11.25h.01"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
