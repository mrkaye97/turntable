import { type ReactNode, createContext, useContext, useState } from "react";
import { getProjectBasedLineage } from "../actions/actions";

type LineageContextType = {
  lineageData: {
    [filePath: string]: {
      data: any;
      isLoading: boolean;
      error: string | null;
    };
  };
  fetchFileBasedLineage: (filePath: string) => Promise<void>;
};

export const LineageContext = createContext<LineageContextType | undefined>(
  undefined,
);

export const LineageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lineageData, setLineageData] = useState({});

  const fetchFileBasedLineage = async (filePath: string) => {
    setLineageData({
      ...lineageData,
      [filePath]: {
        data: null,
        isLoading: true,
        error: null,
      },
    });
    const result = await getProjectBasedLineage({
      filePath,
      successor_depth: 1,
      predecessor_depth: 1,
    });
    if (result.error) {
      setLineageData({
        ...lineageData,
        [filePath]: {
          data: null,
          isLoading: false,
          error: result.error,
        },
      });
    } else {
      const { lineage, root_asset } = result;
      setLineageData({
        ...lineageData,
        [filePath]: {
          data: { lineage, root_asset },
          isLoading: false,
          error: null,
        },
      });
    }
  };

  return (
    <LineageContext.Provider value={{ lineageData, fetchFileBasedLineage }}>
      {children}
    </LineageContext.Provider>
  );
};

export const useLineage = () => {
  const context = useContext(LineageContext);
  if (context === undefined) {
    throw new Error("useLineage must be used within a LineageProvider");
  }
  return context;
};
