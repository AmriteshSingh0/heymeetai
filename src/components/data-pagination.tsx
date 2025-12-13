import { Button } from "@/components/ui/button";
import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page?: number) => void;
}

const DataPagination = ({ page, onPageChange, totalPages }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {page} of {totalPages || 1}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant={"outline"}
          size={"sm"}
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1,page - 1))}
        >
          Previous
        </Button>
        <Button
         variant={"outline"}
         size={"sm"}
         onClick={() => onPageChange(page + 1)}
         disabled={page === totalPages || !totalPages}>Next</Button>
      </div>
    </div>
  );
};

export default DataPagination;