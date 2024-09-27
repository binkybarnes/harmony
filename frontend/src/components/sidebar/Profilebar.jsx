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
    <div className="text-content-header flex items-center justify-between bg-base-300 p-1">
      <div
        onClick={handleClick}
        className="hover:bg-base-50 flex min-w-0 items-center gap-2 rounded-md p-1 hover:cursor-pointer"
      >
        <div className="group relative h-10 w-10 overflow-hidden rounded-md bg-cyan-700">
          {authUser.s3_icon_key ? (
            <img
              draggable={false}
              className="h-10 w-10"
              src={`https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/user-icons/${authUser.s3_icon_key}`}
            />
          ) : (
            <img
              className="h-10 w-10"
              src={`https://robohash.org/${authUser.display_username}`}
            />
          )}
        </div>

        <p className="mr-1 truncate font-medium">{authUser.display_username}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profilebar;
