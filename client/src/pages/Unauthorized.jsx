import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-6 text-red-600">
        <ShieldAlert size={64} strokeWidth={1.5} />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">Access Denied</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Oops! It looks like you don't have the permissions required to view this section of <strong>RestaurantQrify</strong>.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 font-medium text-white transition hover:bg-orange-700 shadow-md active:scale-95"
        >
          <Home size={18} />
          Return Dashboard
        </button>
      </div>
    </div>
  );
}