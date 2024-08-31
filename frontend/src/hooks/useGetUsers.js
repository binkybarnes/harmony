// // send list of server_ids, get back list of user lists

// import { useEffect, useState, useMemo } from "react";
// import toast from "react-hot-toast";

// // serverIds: list of server_ids
// const useGetUsers = (serverIds) => {
//   const [loading, setLoading] = useState(false);
//   const [usersList, setUsersList] = useState([]);
//   // constructing query
//   // ex: http://127.0.0.1:5000/api/users/get/users?server_ids=4&server_ids=5&server_ids=6
//   const queryString = useMemo(() => {
//     const params = new URLSearchParams();
//     serverIds.forEach((server_id) => params.append("server_ids", server_id));
//     return params.toString();
//   }, [serverIds]);

//   useEffect(() => {
//     const getUsers = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/users/get/users?${queryString}`, {
//           method: "GET",
//         });
//         const data = await res.json();
//         if (!res.ok) {
//           throw new Error(data.error);
//         }
//         setUsersList(data);
//       } catch (error) {
//         toast.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     getUsers();
//   }, [queryString]);

//   return { loading, usersList };
// };

// export default useGetUsers;
