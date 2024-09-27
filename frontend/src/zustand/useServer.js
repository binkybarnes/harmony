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
  addServer: (newServer) =>
    set((state) => ({ servers: [newServer, ...state.servers] })),
  removeServer: (server_id) =>
    set((state) => ({
      servers: state.servers.filter((server) => server.server_id !== server_id),
    })),

  // {server, channel, users}
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (newConversation) =>
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
    })),
}));

export default useServer;
