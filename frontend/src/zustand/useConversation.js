import { create } from "zustand";

const useConversation = create((set) => ({
  selectedServer: null,
  setSelectedConversation: (selectedServer) => set({ selectedServer }),
  messages: [],
  setMessages: (messages) => set({ messages }),
}));

export default useConversation;
