import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import Tooltip from "../../components/serverbar/tooltip/Tooltip";
import Sidebar from "../../components/sidebar/Sidebar";
import { PopupProvider } from "../../components/popupContext/PopupContext";

const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <PopupProvider>
        <Serverbar />
        <Tooltip />
      </PopupProvider>

      <Sidebar />
      <MessageContainer />
    </div>
  );
};
export default Home;
