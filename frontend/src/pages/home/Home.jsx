import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import Tooltip from "../../components/serverbar/tooltip/Tooltip";
import Sidebar from "../../components/sidebar/Sidebar";
import { TooltipProvider } from "../../components/serverbar/tooltip/TooltipContext";

const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <TooltipProvider>
        <Serverbar />
        <Tooltip />
      </TooltipProvider>

      <Sidebar />
      <MessageContainer />
    </div>
  );
};
export default Home;
