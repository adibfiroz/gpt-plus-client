import { Link, useLocation, useNavigate } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";
import { Ellipsis, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ChatList = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const navigate = useNavigate();

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const userChat = data || [];

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (chatId) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete chat");
        }
        // Handle 204 (No Content)
        if (res.status === 204) {
          return null; // No response body to return
        }
        if (res.status === 200) {
          queryClient
            .invalidateQueries({ queryKey: ["userChats"] })
            .then(() => {
              navigate("/dashboard");
            });
        }
        return res.json();
      });
    },
  });

  const handleDelete = (chatId) => {
    mutation.mutate(chatId);
  };

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list transition-all duration-200">
        {!data ? (
          <div>No chats</div>
        ) : (
          <>
            {isPending
              ? "Loading..."
              : error
              ? "Something went wrong!"
              : userChat
                  ?.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )
                  .map((chat) => (
                    <div
                      key={chat._id}
                      className={`chatH flex group/item justify-between items-center ${
                        chat._id === chatId ? "bg-[#2c2937] text-sm" : "text-sm"
                      }`}
                    >
                      <Link
                        className=" truncate py-2.5 px-2 flex-1"
                        to={`/dashboard/chats/${chat._id}`}
                      >
                        <div className=" truncate">{chat.title}</div>
                      </Link>
                      <div
                        onClick={() => handleDelete(chat._id)}
                        className="p-1 md:hidden group-hover/item:block mr-2 cursor-pointer hover:bg-gray-600/50 hover:text-red-400 rounded-md"
                      >
                        <Trash size={18} className=" " />
                      </div>
                    </div>
                  ))}
          </>
        )}
      </div>

      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to GPT plus</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
