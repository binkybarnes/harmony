import { useState } from "react";
import toast from "react-hot-toast";

const useEditUser = () => {
  const [loading, setLoading] = useState(false);

  const editUser = async (user_id, user_icon) => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (user_icon) {
        formData.append("user_icon", user_icon);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/edit`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, editUser };
};

export default useEditUser;
