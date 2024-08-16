import MessageContainer from "../../components/messages/MessageContainer";
import Serverbar from "../../components/serverbar/Serverbar";
import Sidebar from "../../components/sidebar/Sidebar";
const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <Serverbar />
      <Sidebar />
      <MessageContainer />
    </div>
  );
};
export default Home;
