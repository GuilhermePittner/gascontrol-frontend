import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, Lock } from "lucide-react";

export default function Login() {

  {/* create an instane of navigate method
      and get the route/path of actual page */}
  const navigate = useNavigate();
  const location = useLocation();


  {/* state regarding login situation
    (if user misses user/password or tries
    to access a protected route) */}
  const [loginError, setLoginError] = useState("");


  {/* hook-form in order to validate
    the log in */}
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  {/* if user tries to access a protected route
    without loging in, an error message appears */}
  useEffect(() => {
    if (location.state?.fromDashboard) {
      setLoginError("Please log in first.");
    }
  }, [location.state]);


  {/* fake log in request with hardcoded admin/password
    if user misses it, an error message appears
    also a fake token is stored on localStorage */}
  const onSubmit = async (data) => {
    const { user, pass } = data;

    if (user === "admin" && pass === "1234") {
      localStorage.setItem("token", "fake-token");
      navigate("/dashboard");
    } else {
      setLoginError("Invalid username or password.");
    }
  };


  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[rgb(15,15,30)] via-[rgb(30,30,60)] to-[rgb(50,10,80)]">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-10 w-[350px]">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-white tracking-tight">
          GasControl
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Sign in with your credentials
        </p>


        {/* if user gets an error, this div pops up with the error message */}
        {loginError && (
          <div className="bg-red-600/80 text-white px-4 py-2 rounded-lg mb-4 text-center shadow-md animate-fadeIn">
            {loginError}
          </div>
        )}


        {/* login form connected to form validator */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <User
              className="absolute left-3 top-3 text-gray-300"
              size={20}
            />

            {/* user input (required field connected to hook-form) 
                if user leave it blank, the "required" message is shown */}
            <input
              type="text"
              placeholder="Username"
              autoComplete="off"
              {...register("user", { required: "Username is required" })}
              className={`pl-10 w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.user ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.user && (
              <span className="text-red-400 text-sm mt-1 block">
                {errors.user.message}
              </span>
            )}
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-3 text-gray-300"
              size={20}
            />

            {/* password input (required field connected to hook-form) 
                if user leave it blank, the "required" message is shown */}
            <input
              type="password"
              placeholder="Password"
              autoComplete="off"
              {...register("pass", { required: "Password is required" })}
              className={`pl-10 w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.pass ? "ring-2 ring-red-500" : ""
              }`}
            />
            {errors.pass && (
              <span className="text-red-400 text-sm mt-1 block">
                {errors.pass.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all py-3 rounded-xl text-white font-bold shadow-lg hover:cursor-pointer active:scale-95 active:shadow-md"
          >
            Sign In
          </button>
        </form>
          
        {/* forgot password field
            (not working) */}
        <p className="text-sm text-gray-400 text-center mt-6">
          Forgot your password?{" "}
          <a
            href="#"
            className="text-purple-400 underline hover:text-purple-200 transition-colors"
          >
            Recover
          </a>
        </p>
      </div>
    </div>
  );
}
