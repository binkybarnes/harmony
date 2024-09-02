import { create } from "zustand";

const useServer = create((set) => ({
  selectedServer: null,
  setSelectedServer: (selectedServer) => set({ selectedServer }),
  selectedChannel: null,
  setSelectedChannel: (selectedChannel) => set({ selectedChannel }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  // members of current server
  users: [],
  setUsers: (users) => set({ users }),
}));

export default useServer;
