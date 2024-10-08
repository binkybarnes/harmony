import { Link } from "react-router-dom";
import Field from "../../components/SignupField/Field";
import { useCallback, useState } from "react";
import useSignup from "../../hooks/useSignup";

const Signup = () => {
  const [inputs, setInputs] = useState({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });

  const { loading, signup } = useSignup();

  const handleOnChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setInputs((prev) => ({ ...prev, [name]: value }));
    },
    [setInputs],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(inputs);
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-base-200">
      <form
        onSubmit={handleSubmit}
        className="w-[480px] select-none rounded-md bg-base-100 p-8 text-center"
      >
        <h1 className="text-2xl font-semibold text-content-header">
          Create an account
        </h1>
        <div className="text-left">
          <Field
            handleOnChange={handleOnChange}
            name="email"
            header="EMAIL"
            type="text"
          />
          <Field
            handleOnChange={handleOnChange}
            name="username"
            header="USERNAME"
            type="text"
          />
          <Field
            handleOnChange={handleOnChange}
            name="password"
            header="PASSWORD"
            type="password"
          />
          <Field
            handleOnChange={handleOnChange}
            name="confirm_password"
            header="CONFIRM PASSWORD"
            type="password"
          />

          <button
            disabled={loading}
            className="mt-12 h-10 w-full rounded-md bg-primary font-semibold text-white hover:brightness-95 active:brightness-90"
          >
            {loading ? <span className="loading loading-spinner" /> : "Signup"}
          </button>
          <Link
            to={"/login"}
            className="mt-2 text-sm text-cyan-500 hover:cursor-pointer hover:underline"
          >
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
};
export default Signup;

// SIGNUP STARTER CODE

// const Signup = () => {
//   return (
//     <div className="mx-auto flex min-w-96 flex-col items-center justify-center">
//       <div className="w-full rounded-lg bg-gray-400 bg-opacity-0 bg-clip-padding p-6 shadow-md backdrop-blur-lg backdrop-filter">
//         <h1 className="text-center text-3xl font-semibold text-gray-300">
//           Sign Up <span className="text-blue-500">Harmony</span>
//         </h1>
//         <form>
//           <div>
//             <label className="label p-2">
//               <span className="label-text text-base">Username</span>
//             </label>
//             <input
//               type="text"
//               placeholder="joe"
//               className="input input-bordered h-10 w-full max-w-xs"
//             />
//           </div>
//           <div>
//             <label className="label p-2">
//               <span className="label-text text-base">Password</span>
//             </label>
//             <input
//               type="text"
//               placeholder="Enter password"
//               className="input input-bordered h-10 w-full max-w-xs"
//             />
//           </div>
//           <div>
//             <label className="label p-2">
//               <span className="label-text text-base">Confirm Password</span>
//             </label>
//             <input
//               type="text"
//               placeholder="Confirm password"
//               className="input input-bordered h-10 w-full max-w-xs"
//             />
//           </div>
//           <a
//             href="#"
//             className="mt-2 inline-block text-sm hover:text-blue-600 hover:underline"
//           >
//             Already have an account?
//           </a>
//           <div>
//             <button className="btn btn-sm btn-block mt-2 max-w-xs">
//               Sign Up
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default Signup;
