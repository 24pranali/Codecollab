import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NewFileModal } from "./newFileModal";
import socket from "../utils/socket"; // ✅ centralized socket

const languageBoilerplates = {
  javascript: "console.log('Hello, World!');",
  python: "print('Hello, World!')",
  c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}",
  java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
};

const langMap = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
  javascript: 63,
};

const EditorPage = ({ roomId }) => {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(0);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState(""); // ✅ input box
  const socketRef = useRef(socket);
  const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setUsername(storedUsername);
    }

    socket.emit("joinRoom", roomId);

    socket.on("filesUpdate", (updatedFiles) => {
      setFiles(updatedFiles);
    });

    socket.on("codeChange", ({ fileName, code }) => {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.name === fileName ? { ...file, content: code } : file
        )
      );
    });

    socket.on("outputUpdate", ({ output, error }) => {
      setOutput(output);
      setError(error);
    });

    return () => {
      socket.off("filesUpdate");
      socket.off("codeChange");
      socket.off("outputUpdate");
    };
  }, [roomId]);

  const handleEditorChange = (value) => {
    const updatedFiles = [...files];
    updatedFiles[activeFile].content = value;
    setFiles(updatedFiles);

    socket.emit("codeChange", {
      roomId,
      fileName: files[activeFile].name,
      code: value,
    });
  };

  const handleCreateFile = ({ name, language }) => {
    if (!languageBoilerplates[language]) {
      alert("Unsupported language!");
      return;
    }

    const newFile = {
      name,
      language,
      content: languageBoilerplates[language],
    };

    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFile(updatedFiles.length - 1);

    socket.emit("filesUpdate", { roomId, files: updatedFiles });
  };

  const handleRunCode = async () => {
    const language = files[activeFile].language;
    const code = files[activeFile].content;
    const languageId = langMap[language];

    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": "26f45464demshef25e91783e3b2fp11c74cjsnfd2811b43d34",
            "X-RapidAPI-Host": "judge029.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: inputText, // ✅ pass custom input
          }),
        }
      );

      const data = await response.json();

      if (data.stderr) {
        setError(data.stderr);
        setOutput("");
        socketRef.current.emit("outputUpdate", { roomId, output: "", error: data.stderr });
      } else {
        const outputText = data.stdout || data.message || "✅ No output";
        setOutput(outputText);
        setError("");
        socketRef.current.emit("outputUpdate", { roomId, output: outputText, error: "" });
      }
    } catch (error) {
      setError(error.message);
      setOutput("");
      socketRef.current.emit("outputUpdate", { roomId, output: "", error: error.message });
    }
  };

  const saveAllFiles = async () => {
    if (!username) {
      alert("❌ Please login to save your code.");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/saveCode`, {
        roomId,
        files,
      });

      alert("✅ All files saved successfully!");

      files.forEach((file) => {
        const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error("❌ Error saving files:", error);
      alert("❌ Failed to save files!");
    }
  };

  return (
    <div className="flex h-[95vh] flex-col sm:flex-row font-sans">
      <div className="w-full sm:w-[250px] bg-[#282c34] text-white p-3 flex flex-col gap-2 border-r-2 border-[#333]">
        <h3 className="text-lg mb-2">Files</h3>
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveFile(index)}
            className={`m-1 px-3 py-2 rounded text-left text-sm cursor-pointer ${
              activeFile === index ? "bg-gray-500" : "bg-[#524949]"
            }`}
          >
            {file.name}
          </button>
        ))}
        <button
          onClick={() => setIsModalOpen(true)}
          className="my-1 px-3 py-2 bg-[#008CBA] text-white rounded text-sm cursor-pointer"
        >
          + New File
        </button>
        <NewFileModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onCreate={handleCreateFile}
        />
        <button
          onClick={handleRunCode}
          className="my-1 px-3 py-2 bg-[#4CAF50] text-white rounded text-sm cursor-pointer"
        >
          Run Code
        </button>
        <button
          onClick={saveAllFiles}
          className="m-1 px-3 py-2 bg-[#f9a825] text-white rounded text-sm cursor-pointer"
        >
          Save and Download Files
        </button>
      </div>

      <div className="flex-grow p-4 bg-[#1e1e1e] text-white overflow-y-auto max-h-[95vh]">
        {files.length > 0 && (
          <>
            <Editor
              height="60vh"
              language={files[activeFile].language}
              value={files[activeFile].content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 16,
                fontFamily: "Consolas, 'Courier New', monospace",
              }}
            />

            <div className="mt-3">
              <label className="text-white block mb-1 text-sm">Input:</label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter input here..."
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
              ></textarea>
            </div>

            <div
  className="mt-3 bg-[#333] text-white p-4 rounded overflow-auto max-h-52"
>
  <h3 className="text-base mb-1">Output:</h3>
  <pre className="text-sm whitespace-pre-wrap break-words">{output}</pre>
  {error && (
    <>
      <h3 className="text-red-500 mt-2">Error:</h3>
      <pre className="text-red-300 whitespace-pre-wrap break-words">{error}</pre>
    </>
  )}
</div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
