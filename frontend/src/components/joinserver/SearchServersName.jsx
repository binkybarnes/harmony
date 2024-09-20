import { useCallback, useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import useSearchServers from "../../hooks/useSearchServers";

const SearchServersName = ({ setServers }) => {
  const [searchName, setSearchName] = useState(true);
  const inputRef = useRef(null);
  const handleClick = () => {
    setSearchName((prev) => !prev);
    setSearchTerm("");
  };

  const { loading, searchServers } = useSearchServers();
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!searchTerm) return;
    if (searchName) {
      setServers(await searchServers("name", searchTerm));
    } else {
      setServers(await searchServers("id", searchTerm));
    }
  };

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
    };
    inputRef.current.focus();
    document.addEventListener("keydown", focusInput);

    return () => {
      document.removeEventListener("keydown", focusInput);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex h-10 items-center overflow-hidden rounded-md bg-neutral-700 pr-2">
        <RiArrowDropDownLine
          onClick={handleClick}
          className="flex-shrink-0 hover:cursor-pointer"
          size={32}
        />
        <input
          ref={inputRef}
          type="text"
          onChange={handleInputChange}
          value={searchTerm}
          placeholder={`Search server ${searchName ? "name" : "ID"}...`}
          className="h-full flex-1 bg-neutral-700"
        />
        <IoSearchOutline className="flex-shrink-0" size={20} />
      </div>
    </form>
  );
};

export default SearchServersName;
