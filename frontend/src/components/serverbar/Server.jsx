import PropTypes from "prop-types";

const Server = ({ name, onHover }) => {
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onHover(true, name, rect);
  };

  const handleMouseLeave = () => {
    onHover(false, "", null);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group mb-2 h-[48px] w-[48px]"
    >
      <div className="avatar">
        <div className="rounded-md object-contain transition-all duration-200 group-hover:rounded-[2rem]">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
    </div>
  );
};

Server.propTypes = {
  name: PropTypes.string,
  onHover: PropTypes.func,
};

export default Server;

// import { useState } from "react";
// const Server = () => {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <div
//       className="relative mb-2 h-[48px] w-[48px]"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="avatar">
//         <div className="rounded-md object-contain">
//           <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
//         </div>
//       </div>
//       {isHovered && (
//         <div className="absolute bottom-full left-1/2 z-50 bg-black">
//           Server Name
//         </div>
//       )}

//     </div>
//   );
// };

// export default Server;
