import { IoSearchOutline } from "react-icons/io5";

const SearchInput = () => {
  return (
    <div className="border-base-400 h-12 border-b p-2">
      <form>
        <div className="bg-base-400 flex h-8 items-center overflow-hidden rounded-md pr-2">
          <input
            type="text"
            placeholder="Search..."
            className="text-content-normal h-full flex-1 bg-transparent px-2"
          />
          <IoSearchOutline className="text-button flex-shrink-0" size={20} />
        </div>
      </form>
    </div>
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
