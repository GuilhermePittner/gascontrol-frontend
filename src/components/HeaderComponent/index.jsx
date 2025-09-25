import { LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Gasometers", path: "/gasometers" },
  ];

  return (
    <header className="w-full bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-md">
      <h1
        className="text-xl font-bold text-white tracking-wide cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        GasControl
      </h1>

      <nav className="flex gap-6 mx-auto">
        {menu.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`font-medium transition-colors hover:cursor-pointer ${
              location.pathname === item.path
                ? "text-purple-400 underline"
                : "text-white hover:text-purple-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 px-4 py-2 rounded-lg shadow transition active:scale-95 hover:cursor-pointer"
      >
        <LogOut size={18} />
        <span className="font-medium">Log Out</span>
      </button>
    </header>
  );
}
