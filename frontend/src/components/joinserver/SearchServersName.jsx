import { useCallback, useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { RiArrowDropDownLine } from "react-icons/ri";
import useSearchServers from "../../hooks/useSearchServers";
import useServersPopular from "../../hooks/useGetPopularServers";
import PropTypes from "prop-types";

const SearchServersName = ({ setServers }) => {
  const [searchName, setSearchName] = useState(true);
  const { serversPopular } = useServersPopular();
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
    if (!searchTerm) {
      setServers(await serversPopular());
      return;
    }
    if (searchName) {
      setServers(await searchServers("name", searchTerm));
    } else if (typeof searchTerm === "number") {
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
      <div className="bg-base-400 flex h-10 items-center overflow-hidden rounded-md pr-2">
        <RiArrowDropDownLine
          onClick={handleClick}
          className="text-button flex-shrink-0 hover:cursor-pointer"
          size={32}
        />
        <input
          ref={inputRef}
          type="text"
          onChange={handleInputChange}
          value={searchTerm}
          placeholder={`Search server ${searchName ? "name" : "ID"}...`}
          className="text-content-normal h-full flex-1 bg-transparent"
        />
        <IoSearchOutline className="flex-shrink-0" size={20} />
      </div>
    </form>
  );
};

SearchServersName.propTypes = {
  setServer: PropTypes.func,
};
export default SearchServersName;
