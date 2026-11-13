import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { LogoutIcon, PlusIcon } from "./Icons";

function Header() {
  const { currUser, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/toodles/login");
  };

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-xs sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-400 to-orange-600 text-lg shadow-sm">
          👻
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Toodles
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-orange-600"
          onClick={() => router.push("/toodles/createGroup")}
        >
          <PlusIcon />
          <span className="hidden sm:inline">Create group</span>
        </button>

        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
          <Avatar name={currUser?.name} size="sm" />
          <span className="max-w-40 truncate text-sm font-medium text-slate-700">
            {currUser?.name}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          onClick={handleLogout}
        >
          <LogoutIcon />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
