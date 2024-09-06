import { useAuthContext } from "../../context/AuthContext.jsx";
import LogoutButton from "./LogoutButton.jsx";
const Profilebar = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="mx-2 flex items-center justify-between rounded-md bg-base-100 p-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <img
          className="w-10 rounded-md"
          src={`https://robohash.org/${authUser.display_username}`}
        />

        <p className="truncate font-medium">{authUser.display_username}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profilebar;
