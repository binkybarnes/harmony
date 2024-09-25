import { useAuthContext } from "../../context/AuthContext.jsx";
import { usePopupContext } from "../popups/PopupContext.jsx";
import LogoutButton from "./LogoutButton.jsx";
const Profilebar = () => {
  const { setUserMenu, setModalOverlayVisible } = usePopupContext();
  const { authUser } = useAuthContext();

  const handleClick = (event) => {
    event.stopPropagation();
    setModalOverlayVisible(true);
    setUserMenu({ visible: true, user: authUser });
  };
  return (
    <div className="mx-2 flex items-center justify-between rounded-md bg-base-100 p-1.5">
      <div
        onClick={handleClick}
        className="flex min-w-0 items-center gap-2 rounded-md hover:cursor-pointer hover:bg-red-500"
      >
        <img
          className="w-10 rounded-md"
          src={`https://robohash.org/${authUser.display_username}`}
        />

        <p className="mr-1 truncate font-medium">{authUser.display_username}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profilebar;
