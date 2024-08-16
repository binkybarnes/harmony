import Servers from "./Servers";

const Serverbar = () => {
  return (
    <div className="flex h-screen w-[72px] flex-col items-center bg-red-400 py-2">
      <div className="h-[48px] w-[48px] bg-yellow-300">DMS BUTTON</div>
      <Servers />
      <div className="h-[48px] w-[48px] bg-yellow-300">SERVER BUTTON</div>
    </div>
  );
};

export default Serverbar;
