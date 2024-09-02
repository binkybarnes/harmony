import useServer from "../../zustand/useServer";

// toolbar contains information about the selected channel
const Toolbar = () => {
  const selectedChannel = useServer((state) => state.selectedChannel);
  return (
    <div className="mt-2 flex h-10 select-none items-center gap-2 rounded-md bg-red-500 p-1.5 text-neutral-200">
      <img
        className="w-8 rounded-md"
        src={`https://robohash.org/${selectedChannel.channel_name}`}
      />

      <p className="truncate font-semibold text-neutral-200">
        {selectedChannel.channel_name}
      </p>
    </div>
  );
};

export default Toolbar;
