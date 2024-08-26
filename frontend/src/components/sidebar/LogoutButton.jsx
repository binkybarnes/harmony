import { VscSignOut } from "react-icons/vsc";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
  const { loading, logout } = useLogout();
  return (
    <div
      onClick={logout}
      className="text-error hover:cursor-pointer hover:brightness-125 active:text-neutral-200"
    >
      {loading ? (
        <span className="loading loading-spinner" />
      ) : (
        <VscSignOut className="flex-shrink-0" size="20px" />
      )}
    </div>
  );
};

export default LogoutButton;
