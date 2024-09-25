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
import { Navigate, Route, Routes, Router } from "react-router-dom";
import ServerSettingsMenu from "../../components/popups/serverSettings/ServerSettingsMenu";
import UserMenu from "../../components/popups/userMenu/UserMenu";
import useListenServerCreated from "../../hooks/websocketListeners/useListenServerCreated";
import useListenMessages from "../../hooks/websocketListeners/useListenMessages";

const Home = () => {
  const selectedServer = useServer((state) => state.selectedServer);
  useListenServerCreated();
  useListenMessages();
  return (
    <div className="flex overflow-hidden">
      <PopupProvider>
        <Serverbar />

        <Routes>
          <Route
            path="/discover"
            element={selectedServer ? <Navigate to="/" /> : <DiscoverServers />}
          />
          <Route
            path="/"
            element={
              <>
                <Sidebar />
                <MessageContainer />
              </>
            }
          />

          {/* {!selectedServer && discoverServersVisible ? (
            <DiscoverServers />
          ) : (
            <>
              <Sidebar />
              <MessageContainer />
            </>
          )} */}
        </Routes>

        <div className="select-none">
          <InfoTooltip />
          <ServerTooltip />
          <ServerDropdown />
          <ModalOverlay />
          <CreateChannelMenu />
          <CreateServerMenu />
          <ServerSettingsMenu />
          <UserMenu />
        </div>
      </PopupProvider>
    </div>
  );
};
export default Home;
