import SearchServersName from "./SearchServersName";

const SearchServers = () => {
  return (
    <div className="mb-4 flex justify-center">
      <div className="w-[720px] text-center">
        <h1 className="mb-2 text-xl font-semibold text-neutral-200">
          Join a server
        </h1>
        <SearchServersName />
      </div>
    </div>
  );
};

export default SearchServers;
