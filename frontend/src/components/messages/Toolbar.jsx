import { useAuthContext } from "../../context/AuthContext";
import useServer from "../../zustand/useServer";
import { TbBrandAmongUs } from "react-icons/tb";

// toolbar contains information about the selected channel
const Toolbar = () => {
  const selectedChannel = useServer((state) => state.selectedChannel);
  const selectedConversation = useServer((state) => state.selectedConversation);
  // handle groupchat later, only handling dm rn
  const { authUser } = useAuthContext();
  const otherUser = selectedConversation?.users.filter(
    (user) => user.user_id !== authUser.user_id,
  )[0];

  return (
    <div className="text-content-header border-base-400 flex h-12 select-none items-center gap-2 border-b bg-base-100 p-2">
      {selectedConversation ? (
        <div className="h-8 w-8 overflow-hidden rounded-md bg-primary">
          <img
            draggable={false}
            className="h-8 w-8"
            src={
              otherUser.s3_icon_key
                ? `https://${import.meta.env.VITE_CLOUDFRONT_IMAGE_URL}/user-icons/${otherUser.s3_icon_key}`
                : `https://robohash.org/${otherUser.display_username}`
            }
          />
        </div>
      ) : null}

      {!selectedConversation ? (
        <TbBrandAmongUs className="flex-shrink-0" size={20} />
      ) : null}

      <p className="truncate font-semibold">
        {selectedConversation
          ? otherUser.display_username
          : selectedChannel.channel_name}
      </p>
    </div>
  );
};

export default Toolbar;
