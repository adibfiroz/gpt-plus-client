import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import GoToBottom from "../../components/GoToBottom";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const [copyStatus, setCopyStatus] = useState(false);
  const wrapperRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const onCopyText = () => {
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 3000);
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, chatId, question, answer, img]);

  return (
    <div className="chatPage">
      <div className="wrapper" ref={wrapperRef}>
        {isPending
          ? "Loading..."
          : error
          ? "Something went wrong!"
          : data?.history?.map((message, i) => (
              <div
                key={message._id}
                className={`mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl ${
                  message.role !== "user" && "mb-5"
                }`}
              >
                <div className="chat">
                  <div
                    className={
                      message.role === "user" ? "flex justify-end" : ""
                    }
                  >
                    {message.img && (
                      <IKImage
                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                        path={message?.img}
                        height="300"
                        width="400"
                        transformation={[{ height: 300, width: 400 }]}
                        loading="lazy"
                        lqip={{ active: true, quality: 20 }}
                      />
                    )}
                  </div>
                  <div
                    className={
                      message.role === "user"
                        ? "message user mt-5 mr-5"
                        : "message"
                    }
                    key={i}
                  >
                    <Markdown
                      components={{
                        code({ className, ...props }) {
                          const hasLang = /language-(\w+)/.exec(
                            className || ""
                          );
                          return hasLang ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={hasLang[1]}
                              PreTag="div"
                              className="mockup-code  w-full my-2 bg-black/10 p-2 rounded-lg scrollbar-thin scrollbar-track-base-content/5 scrollbar-thumb-base-content/40 scrollbar-track-rounded-md scrollbar-thumb-rounded"
                              showLineNumbers={true}
                              useInlineStyles={true}
                            >
                              {String(props.children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props} />
                          );
                        },
                        pre: (pre) => {
                          const codeChunk =
                            pre.node.children[0].children[0].value;

                          const language =
                            pre.children[0]?.props.className.replace(
                              /language-/g,
                              ""
                            );

                          return (
                            <div className="relative">
                              <button
                                style={{
                                  right: 0,
                                }}
                                className="absolute tooltip tooltip-left  z-10 mr-2 mt-2"
                              >
                                <CopyToClipboard
                                  text={codeChunk}
                                  onCopy={onCopyText}
                                >
                                  {copyStatus ? (
                                    <Check size={18} />
                                  ) : (
                                    <Copy size={18} />
                                  )}
                                </CopyToClipboard>
                              </button>
                              <span
                                style={{
                                  bottom: 0,
                                  right: 0,
                                }}
                                className="absolute hidden z-10 mb-5 mr-1 rounded-lg bg-base-content/40 p-1 text-xs uppercase text-base-300 backdrop-blur-sm"
                              >
                                {language}
                              </span>
                              <pre {...pre}></pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {message.parts[0].text}
                    </Markdown>
                  </div>
                </div>
              </div>
            ))}

        <div className=" mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-end mb-5">
          {img.isLoading && <div className="">Loading...</div>}
          {img.dbData?.filePath && (
            <IKImage
              urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
              path={img.dbData?.filePath}
              width="380"
              transformation={[{ width: 380 }]}
            />
          )}
        </div>
        {question && (
          <div className="w-full mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col">
            <div className="message user">
              <Markdown>{question}</Markdown>
            </div>
          </div>
        )}
        {answer && (
          <div className="message w-full mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
            <Markdown>{answer}</Markdown>
          </div>
        )}
        <GoToBottom wrapperRef={wrapperRef} />
        <div className="endChat" ref={endRef}></div>
      </div>
      {data && (
        <NewPrompt
          setImg={setImg}
          img={img}
          setQuestion={setQuestion}
          question={question}
          setAnswer={setAnswer}
          answer={answer}
          data={data}
        />
      )}
    </div>
  );
};

export default ChatPage;
