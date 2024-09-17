import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";

const SearchServersName = () => {
  const [searchName, setSearchName] = useState(true);
  const handleMouseDown = () => setSearchName((prev) => !prev);
  return (
    <form className="">
      <div className="flex h-10 items-center overflow-hidden rounded-md bg-neutral-700 pr-2">
        <RiArrowDropDownLine
          onMouseDown={handleMouseDown}
          className="flex-shrink-0 hover:cursor-pointer"
          size={32}
        />
        <input
          type="text"
          placeholder={`Search server ${searchName ? "name" : "ID"}...`}
          className="h-full flex-1 bg-neutral-700"
        />
        <IoSearchOutline className="flex-shrink-0" size={20} />
      </div>
    </form>
  );
};

export default SearchServersName;
