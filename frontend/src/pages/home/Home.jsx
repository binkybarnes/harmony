import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import ServerTooltip from "../../components/popups/tooltip/ServerTooltip";
import ServerDropdown from "../../components/popups/serverDropdown/ServerDropdown";
import Sidebar from "../../components/sidebar/Sidebar";
import { PopupProvider } from "../../components/popups/PopupContext";
import DiscoverServers from "../../components/joinserver/DiscoverServers";

const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <PopupProvider>
        <Serverbar />

        <DiscoverServers />
        {/* <Sidebar />
        <MessageContainer /> */}

        <div className="select-none">
          <ServerTooltip />
          <ServerDropdown />
        </div>
      </PopupProvider>
    </div>
  );
};
export default Home;
