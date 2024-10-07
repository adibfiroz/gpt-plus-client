import { ArrowDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const GoToBottom = ({ wrapperRef }) => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scrolled = wrapper.scrollTop;
    const scrollHeight = wrapper.scrollHeight - wrapper.clientHeight;

    if (scrolled < scrollHeight - 200 && !visible) {
      setVisible(true);
    } else if (scrolled >= scrollHeight - 200 && visible) {
      setVisible(false);
    }
  };

  const scrollToBottom = () => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.scrollTo({
        top: wrapper.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("scroll", toggleVisible);
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener("scroll", toggleVisible);
      }
    };
  }, [visible, wrapperRef]);

  return (
    <div className={`text-center sticky z-30 bottom-2`}>
      <button
        className={`cursor-pointer mt-3 z-10 w-9 h-9 mx-auto bg-gray-500/50 rounded-full ${
          visible ? "block" : "hidden"
        }`}
        onClick={scrollToBottom}
        style={{ boxShadow: "0 0 10px 0 rgba(0,0,0,.3)" }}
      >
        <ArrowDown size={20} className="text-white m-2" />
      </button>
    </div>
  );
};

export default GoToBottom;
