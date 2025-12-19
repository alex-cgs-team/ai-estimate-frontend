import { ArrowBack } from "@/components";
import { HistoryTable } from "./components/history-table/HistoryTable.component";

export const HistoryPage = () => {
  return (
    <div>
      <ArrowBack />
      <div className="mt-16 mx-10">
        <HistoryTable />
      </div>
    </div>
  );
};
