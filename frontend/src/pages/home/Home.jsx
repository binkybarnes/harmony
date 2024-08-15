import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
const Home = () => {
  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <MessageContainer />
    </div>
    // <div className="h-32 w-32 overflow-auto bg-red-500 scrollbar">
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    //   <div>bruh</div>
    // </div>
  );
};
export default Home;
