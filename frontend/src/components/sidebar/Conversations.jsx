import useGetServers from "../../hooks/useGetServers";
import useGetUsers from "../../hooks/useGetUsers";
import Conversation from "./Conversation";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import useGetConversations from "../../hooks/useGetConversations";

const validateNestedUsers = (nestedUsers, serverType) => {
  // correct number of users for each server type
  let numUsersCheck;
  switch (serverType) {
    case "Dm":
      numUsersCheck = (users) => users.length == 2;
      break;
    case "GroupChat":
      numUsersCheck = (users) => users.length > 2;
      break;
    case "Server":
      numUsersCheck = (users) => users.length > 0;
      break;
  }

  if (!nestedUsers.every((users) => numUsersCheck(users))) {
    // Find the invalid arrays for better error context
    const invalidArrays = nestedUsers.filter((users) => !numUsersCheck(users));
    console.log("Some servers have wrong number of users");
    console.log(invalidArrays);
    // throw new Error(
    //   `Validation failed. Some servers have wrong number of users: ${JSON.stringify(invalidArrays)}`,
    // );
  }
};

const Conversations = () => {
  // TODO: put groupchats in here
  const { loading, servers, serverIds, usersList } = useGetConversations("Dm");
  const { authUser } = useAuthContext();
  const user_id = authUser.user_id;

  const mapDmConversations = usersList.map((users, i) => {
    if (users.length != 2) {
      toast.error("DM servers should have only 2 members");
      return null;
    }
    const otherUsers = users.filter((user) => user.user_id !== user_id);

    return (
      <Conversation
        key={serverIds[i]}
        otherUsers={otherUsers}
        server={servers[i]}
      />
    );
  });

  return (
    <nav className="scrollbar-sidebar flex-1 overflow-y-scroll pl-2">
      {mapDmConversations}
    </nav>
  );
};

export default Conversations;
