import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./dashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const DashboardPage = () => {
  const [prompt, setPrompt] = useState("");
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const text = e.target.text.value;
    if (!prompt) return;

    mutation.mutate(prompt);
  };
  return (
    <div className="dashboardPage">
      <div className="texts p-5">
        <div className="logo">
          <img src="/logo.png" alt="" />
          <h1 className="text-5xl md:text-6xl lg:text-7xl">GPT PLUS</h1>
        </div>
        <div className="options gap-x-5 sm:gap-x-10">
          <div className="option">
            <img src="/chat.png" alt="" />
            <span>Create a New Chat</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="" />
            <span>Analyze Images</span>
          </div>
          <div className="option">
            <img src="/code.png" alt="" />
            <span>Help me with my Code</span>
          </div>
        </div>
      </div>
      <div className="p-5 w-full">
        <div className="formContainer rounded-full w-full mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col">
          <form onSubmit={handleSubmit}>
            <input
              onChange={(e) => setPrompt(e.target.value)}
              type="text"
              name="text"
              placeholder="Ask me anything..."
              className="p-5 w-full"
            />
            <button
              disabled={prompt.length >= 1 ? false : true}
              className={` flex-shrink-0 ${
                prompt.length >= 1 ? "!bg-white" : "pointer-events-none"
              }`}
            >
              <img src="/arrow.png" alt="" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
