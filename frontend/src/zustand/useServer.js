import { create } from "zustand";

const useServer = create((set) => ({
  selectedServer: null,
  setSelectedServer: (selectedServer) => set({ selectedServer }),
  selectedChannel: null,
  setSelectedChannel: (selectedChannel) => set({ selectedChannel }),
  // i need this so the stupid toolbar can use the other user as the channel name
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (newMessage) =>
    set((state) => ({ messages: [...state.messages, newMessage] })),
  // members of current server
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (newUser) => set((state) => ({ users: [newUser, ...state.users] })),

  servers: [],
  setServers: (servers) => set({ servers }),
  updateServerUnread: (server_id, unread_messages) =>
    set((state) => ({
      servers: state.servers.map((server) => {
        if (server.server_id === server_id) {
          return {
            ...server,
            unread_messages:
              unread_messages === "increment"
                ? server.unread_messages + 1
                : unread_messages,
          };
        }
        return server;
      }),
    })),
  addServer: (newServer) =>
    set((state) => ({ servers: [newServer, ...state.servers] })),
  removeServer: (server_id) =>
    set((state) => ({
      servers: state.servers.filter((server) => server.server_id !== server_id),
    })),

  // {server, channel, users}
  conversations: [],
  updateConversationUnread: (server_id, unread_messages) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) => {
        if (conversation.server.server_id === server_id) {
          return {
            ...conversation,
            server: {
              ...conversation.server,
              unread_messages:
                unread_messages === "increment"
                  ? conversation.server.unread_messages + 1
                  : unread_messages,
            },
          };
        }
        return conversation;
      }),
    })),
  setConversations: (conversations) =>
    set({
      conversations: conversations.sort((a, b) => {
        const dateA = new Date(a.server.last_message_at);
        const dateB = new Date(b.server.last_message_at);
        return dateB.valueOf() - dateA.valueOf(); // Sort in descending order (most recent first)
      }),
    }),
  addConversation: (newConversation) =>
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
    })),
}));

export default useServer;
