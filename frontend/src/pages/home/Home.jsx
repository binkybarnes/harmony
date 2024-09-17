import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import ServerTooltip from "../../components/popups/tooltip/ServerTooltip";
import ServerDropdown from "../../components/popups/serverDropdown/ServerDropdown";
import Sidebar from "../../components/sidebar/Sidebar";
import { PopupProvider } from "../../components/popups/PopupContext";
import DiscoverServers from "../../components/joinserver/DiscoverServers";
import InfoTooltip from "../../components/popups/tooltip/InfoTooltip";
import CreateChannelMenu from "../../components/popups/createChannel/CreateChannelMenu";
import ModalOverlay from "../../components/popups/ModalOverlay";
import { useState } from "react";
import useServer from "../../zustand/useServer";
import CreateServerMenu from "../../components/popups/createServer/CreateServerMenu";

const Home = () => {
  const [discoverServersVisible, setDiscoverServersVisible] = useState(false);
  const selectedServer = useServer((state) => state.selectedServer);
  return (
    <div className="flex overflow-hidden">
      <PopupProvider>
        <Serverbar setDiscoverServersVisible={setDiscoverServersVisible} />

        {!selectedServer && discoverServersVisible ? (
          <DiscoverServers />
        ) : (
          <>
            <Sidebar />
            <MessageContainer />
          </>
        )}

        <div className="select-none">
          <InfoTooltip />
          <ServerTooltip />
          <ServerDropdown />
          <ModalOverlay />
          <CreateChannelMenu />
          <CreateServerMenu />
        </div>
      </PopupProvider>
    </div>
  );
};
export default Home;
