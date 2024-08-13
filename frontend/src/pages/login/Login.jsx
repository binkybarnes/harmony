const Login = () => {
  return (
    <div className="mx-auto flex min-w-96 flex-col items-center justify-center">
      <div className="w-full rounded-lg bg-gray-400 bg-opacity-0 bg-clip-padding p-6 shadow-md backdrop-blur-lg backdrop-filter">
        <h1 className="text-center text-3xl font-semibold text-gray-300">
          Login <span className="text-blue-500">Harmony</span>
        </h1>
        <form>
          <div>
            <label className="label p-2">
              <span className="label-text text-base">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="input input-bordered h-10 w-full max-w-xs"
            />
          </div>
          <div>
            <label className="label p-2">
              <span className="label-text text-base">Password</span>
            </label>
            <input
              type="text"
              placeholder="Enter password"
              className="input input-bordered h-10 w-full max-w-xs"
            />
          </div>
          <a
            href="#"
            className="mt-2 inline-block text-sm hover:text-blue-600 hover:underline"
          >
            {"Don't"} have an account?
          </a>
          <div>
            <button className="btn btn-sm btn-block mt-2 max-w-xs">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;

// LOGIN STARTER CODE
// const Login = () => {
//   return (
//     <div className="mx-auto flex min-w-96 flex-col items-center justify-center">
//       <div className="w-full rounded-lg bg-gray-400 bg-opacity-0 bg-clip-padding p-6 shadow-md backdrop-blur-lg backdrop-filter">
//         <h1 className="text-center text-3xl font-semibold text-gray-300">
//           Login <span className="text-blue-500">Harmony</span>
//         </h1>
//         <form>
//           <div>
//             <label className="label p-2">
//               <span className="label-text text-base">Username</span>
//             </label>
//             <input
//               type="text"
//               placeholder="Enter username"
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
//           <a
//             href="#"
//             className="mt-2 inline-block text-sm hover:text-blue-600 hover:underline"
//           >
//             {"Don't"} have an account?
//           </a>
//           <div>
//             <button className="btn btn-sm btn-block mt-2 max-w-xs">
//               Login
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default Login;
