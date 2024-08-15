const SearchInput = () => {
  return (
    <form className="px-2 pt-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
          <svg
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="input h-10 w-full rounded-md pe-10"
        />
      </div>
    </form>
  );
};

export default SearchInput;
