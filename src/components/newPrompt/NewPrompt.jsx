import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useAutosizeTextArea = (textAreaRef, value) => {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};

const NewPrompt = ({
  data,
  setImg,
  img,
  answer,
  question,
  setQuestion,
  setAnswer,
}) => {
  const [prompt, setPrompt] = useState("");
  const [promptLength, setPromptLength] = useState(false);
  const textAreaRef = useRef();

  useAutosizeTextArea(textAreaRef.current, prompt);

  const chat = model.startChat({
    history: data?.history.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts[0]?.text }],
    })),

    generationConfig: {
      // maxOutputTokens: 100,
    },
  });

  const formRef = useRef(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
          setPrompt("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      mutation.mutate();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const text = e.target.text.value;
    if (!prompt.trim()) return;
    add(prompt, false);
  };

  // IN PRODUCTION WE DON'T NEED IT
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;

    if (prompt.trim().length >= 1) {
      setPromptLength(true);
    } else {
      setPromptLength(false);
    }
  }, []);

  const handleChange = (evt) => {
    const inputValue = evt.target.value;
    const maxValueLength = 1500; // Maximum number of digits allowed

    // Check if the length of the input value exceeds the maximum value length
    if (inputValue.length > maxValueLength) {
      // If it exceeds, truncate the input value to the maximum length
      evt.target.value = inputValue.slice(0, maxValueLength);
    }
    setPrompt(evt.target.value);
  };

  return (
    <>
      {/* ADD NEW CHAT */}
      <form
        className="w-full bg-[#12101b] p-5 text-center sticky bottom-0 z-20"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="newForm mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full">
          <Upload setImg={setImg} />

          <textarea
            onChange={handleChange}
            ref={textAreaRef}
            type="text"
            name="text"
            placeholder="Ask anything..."
            className="w-full max-h-[120px] !min-h-6 border-0 bg-transparent my-4 outline-none resize-none"
            style={{ height: "24px" }}
          />
          <button
            disabled={prompt.length >= 1 ? false : true}
            className={` transition-all flex-shrink-0 duration-200 ${
              prompt.trim().length >= 1 ? "!bg-white" : "pointer-events-none"
            }`}
          >
            <img src="/arrow.png" alt="" />
          </button>
        </div>
      </form>
    </>
  );
};

export default NewPrompt;
