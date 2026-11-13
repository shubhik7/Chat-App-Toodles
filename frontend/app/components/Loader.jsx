function Loader({ label = "Loading…", fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-sm text-slate-500 ${
        fullPage ? "min-h-screen bg-slate-100" : "h-full py-10"
      }`}
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
      {label}
    </div>
  );
}

export default Loader;
