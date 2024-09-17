import { IoSearchOutline } from "react-icons/io5";

const SearchInput = () => {
  return (
    <form className="mx-2">
      <div className="flex h-10 items-center overflow-hidden rounded-md bg-base-100 pr-2">
        <input
          type="text"
          placeholder="Search..."
          className="h-full flex-1 bg-base-100 px-2"
        />
        <IoSearchOutline className="flex-shrink-0" size={20} />
      </div>
    </form>
  );
};

export default SearchInput;

// import { IoSearchOutline } from "react-icons/io5";

// const SearchInput = () => {
//   return (
//     <form className="px-2">
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
//           <IoSearchOutline size={20} />
//         </div>
//         <input
//           type="text"
//           placeholder="Search..."
//           className="h-10 w-full rounded-md bg-base-100 pe-10 ps-4"
//         />
//       </div>
//     </form>
//   );
// };

// export default SearchInput;
