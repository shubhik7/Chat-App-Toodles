export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

export const labelClass = "text-sm font-medium text-slate-700";

export const primaryButtonClass =
  "w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60";

export function ErrorText({ children }) {
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
      {children}
    </p>
  );
}

// A conversation: incoming and outgoing bubbles, plus a typing indicator.
function ConversationIllustration({ className }) {
  return (
    <svg
      viewBox="0 0 280 320"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="52" r="16" fill="#fed7aa" />
      <rect
        x="48"
        y="24"
        width="170"
        height="56"
        rx="18"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <rect x="66" y="42" width="110" height="8" rx="4" fill="#cbd5e1" />
      <rect x="66" y="58" width="70" height="8" rx="4" fill="#e2e8f0" />

      <rect x="80" y="104" width="176" height="56" rx="18" fill="#f97316" />
      <rect x="98" y="122" width="120" height="8" rx="4" fill="#fff" fillOpacity=".85" />
      <rect x="98" y="138" width="80" height="8" rx="4" fill="#fff" fillOpacity=".6" />

      <circle cx="24" cy="212" r="16" fill="#bae6fd" />
      <rect
        x="48"
        y="184"
        width="110"
        height="56"
        rx="18"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <circle cx="80" cy="212" r="6" fill="#94a3b8" />
      <circle cx="103" cy="212" r="6" fill="#cbd5e1" />
      <circle cx="126" cy="212" r="6" fill="#e2e8f0" />

      <rect x="150" y="262" width="106" height="44" rx="18" fill="#fdba74" />
      <rect x="168" y="280" width="70" height="8" rx="4" fill="#fff" />
    </svg>
  );
}

// A group card with overlapping avatars, an unread badge and a paper plane.
function GroupIllustration({ className }) {
  return (
    <svg
      viewBox="0 0 260 300"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="20"
        y="40"
        width="220"
        height="150"
        rx="24"
        fill="#fff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <circle cx="70" cy="92" r="24" fill="#fed7aa" stroke="#fff" strokeWidth="4" />
      <circle cx="106" cy="92" r="24" fill="#bae6fd" stroke="#fff" strokeWidth="4" />
      <circle cx="142" cy="92" r="24" fill="#ddd6fe" stroke="#fff" strokeWidth="4" />
      <circle cx="178" cy="92" r="24" fill="#f1f5f9" stroke="#fff" strokeWidth="4" />
      <text
        x="178"
        y="97"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#64748b"
      >
        +3
      </text>
      <rect x="46" y="136" width="150" height="8" rx="4" fill="#cbd5e1" />
      <rect x="46" y="154" width="100" height="8" rx="4" fill="#e2e8f0" />

      <circle cx="228" cy="44" r="16" fill="#f97316" />
      <text
        x="228"
        y="49"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#fff"
      >
        3
      </text>

      <path
        d="M30 280 C 80 280, 110 250, 160 236"
        stroke="#fdba74"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 8"
      />
      <g
        transform="translate(160 200) scale(3)"
        stroke="#f97316"
        strokeWidth=".8"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="m22 2-7 20-4-9-9-4Z" fill="#fff7ed" />
        <path d="M22 2 11 13" />
      </g>
    </svg>
  );
}

function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-slate-200) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-200/40 blur-3xl" />

      <ConversationIllustration className="absolute left-[4%] top-1/2 hidden w-64 -translate-y-1/2 -rotate-3 lg:block xl:left-[8%] xl:w-72" />
      <GroupIllustration className="absolute right-[4%] top-1/2 hidden w-60 -translate-y-1/2 rotate-3 lg:block xl:right-[8%] xl:w-64" />

      <div className="absolute left-[18%] top-[14%] hidden h-3 w-3 rounded-full bg-orange-300 md:block" />
      <div className="absolute right-[22%] top-[18%] hidden h-2 w-2 rounded-full bg-sky-300 md:block" />
      <div className="absolute bottom-[16%] left-[26%] hidden h-2 w-2 rounded-full bg-violet-300 md:block" />
      <div className="absolute bottom-[12%] right-[30%] hidden h-3 w-3 rounded-full bg-orange-200 md:block" />
    </div>
  );
}

function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

export default AuthCard;
