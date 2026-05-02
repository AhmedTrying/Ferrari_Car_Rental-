// SVG icon registry — same paths as the prototype's FCR_ICONS,
// re-exposed as a single React <Icon name="..." /> component.

const PATHS: Record<string, React.ReactNode> = {
  driver: (<>
    <circle cx="12" cy="8" r="3.2"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/><path d="M3 20h18"/>
  </>),
  'no-deposit': (<>
    <rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M5 19l14-14"/>
  </>),
  shield: (<>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>
  </>),
  gauge: (<>
    <path d="M3 14a9 9 0 1 1 18 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/>
  </>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>,
  whatsapp: (
    <path
      d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.89L4 20l4.21-1.1a7.93 7.93 0 0 0 3.83.97h.01a7.94 7.94 0 0 0 7.93-7.94 7.9 7.9 0 0 0-2.38-5.61zm-5.55 12.21h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.51 6.6 6.6 0 0 1-6.64 6.6zm3.62-4.94c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.45.1-.13.2-.51.65-.63.78-.12.13-.23.15-.43.05-.2-.1-.85-.31-1.62-1-.6-.53-1-1.19-1.12-1.39-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.34-.45-.34-.12-.01-.25-.01-.39-.01-.13 0-.35.05-.54.25-.18.2-.7.69-.7 1.67 0 .98.71 1.93.81 2.07.1.13 1.4 2.13 3.39 2.99.47.2.84.32 1.13.42.47.15.91.13 1.25.08.38-.06 1.18-.48 1.34-.95.16-.46.16-.86.12-.94-.05-.08-.18-.13-.38-.23z"
      fill="currentColor" stroke="none"
    />
  ),
  instagram: (<>
    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>
  </>),
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  arrow: <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
  arrowL: <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  star: <path d="M12 3l2.6 5.5 6 .9-4.3 4.3 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.4l6-.9z" fill="currentColor"/>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  edit: <path d="M16 3l5 5-13 13H3v-5z"/>,
  trash: <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
  check: <path d="M5 12l4 4L19 6"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4.5-7 8-7s7 2 8 7"/></>,
  users: <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.8"/><path d="M3 20c.7-3.5 3-5 6-5s5.3 1.5 6 5"/><path d="M14 19c.4-2 2-3 4-3s3.5 1 4 3"/></>,
  car: <><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M3 16v3M21 16v3"/></>,
  dashboard: <><rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/></>,
  money: <><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.5 1-2.5 3-2.5s3 1 3 2.5-1 2-3 2.5-3 1-3 2.5 1 2.5 3 2.5 3-1 3-2.5"/><path d="M12 5v2M12 17v2"/></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  logout: <><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 17l5-5-5-5"/><path d="M21 12H10"/></>,
  sparkle: <><path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z"/><path d="M19 14l.8 2.2 2.2.8-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></>,
  cog: <><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5L7.6 7.6M16.4 16.4l2.1 2.1M5.5 18.5L7.6 16.4M16.4 7.6l2.1-2.1"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  download: <><path d="M12 4v12"/><path d="M6 12l6 6 6-6"/><path d="M4 20h16"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  close: <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>,
  palette: <><circle cx="12" cy="12" r="9"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/><path d="M12 21c-1.7 0-2-2-1-3 1.5-1.5 4 .5 4-1.5 0-1.5 2-2 3.5-2"/></>,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const node = PATHS[name];
  if (!node) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg" className={className}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0.25 }}>
          <Icon name="star" size={16} />
        </span>
      ))}
    </div>
  );
}
