import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import ServerTooltip from "../../components/popups/tooltip/ServerTooltip";
import Sidebar from "../../components/sidebar/Sidebar";
import { PopupProvider } from "../../components/popups/PopupContext";

const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <PopupProvider>
        <Serverbar />
        <ServerTooltip />
      </PopupProvider>

      <Sidebar />
      <MessageContainer />
    </div>
  );
};
export default Home;
