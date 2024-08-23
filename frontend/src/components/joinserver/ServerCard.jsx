const ServerCard = () => {
  return (
    <div className="server-card flex w-48 flex-col overflow-hidden rounded-md bg-red-500 hover:cursor-pointer">
      <img
        className="h-48 w-full object-cover"
        src="https://cdn.discordapp.com/discovery-splashes/662267976984297473/4798759e115d2500fef16347d578729a.jpg?size=600"
      />
      <div className="px-2 py-1">
        <h3 className="truncate font-semibold text-neutral-200">Server Name</h3>
        <p className="text-neutral-200">
          <span className="select-none">ID: </span>
          <span className="rounded-md bg-red-900 px-1 py-0.5">99</span>
        </p>
      </div>
    </div>
  );
};

export default ServerCard;
