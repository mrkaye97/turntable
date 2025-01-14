import { CircleCheck, CircleSlash, CircleX, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useCommandPanelContext } from "./command-panel-context";

export default function CommandPanelList() {
  const {
    commandHistory,
    selectedCommandIndex,
    setSelectedCommandIndex,
    commandPanelState,
    updateCommandById,
  } = useCommandPanelContext();

  useEffect(() => {
    commandHistory.forEach((command) => {
      if (command.status === "running" && commandPanelState === "idling") {
        updateCommandById(command.id, { status: "cancelled" });
      }
    });
  }, [commandHistory]);

  return (
    <div className="flex flex-col">
      {commandHistory.map((item, index) => (
        <div
          key={item.id}
          className={`flex justify-between ${
            index === selectedCommandIndex ? "bg-gray-100" : ""
          } hover:bg-gray-100 cursor-pointer p-2`}
          onClick={() => setSelectedCommandIndex(index)}
        >
          <div
            className={`flex flex-row gap-2 items-center ${
              item.status === "failed" ? "text-red-600" : ""
            }`}
          >
            {item.status === "running" && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            {item.status === "success" && <CircleCheck className="h-4 w-4" />}
            {item.status === "failed" && <CircleX className="h-4 w-4" />}
            {item.status === "cancelled" && <CircleSlash className="h-4 w-4" />}
            <p>dbt {item.command}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            {item.duration && <p>{item.duration}</p>}
            <p>{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
