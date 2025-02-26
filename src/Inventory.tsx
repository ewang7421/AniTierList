import { SortableContext } from "@dnd-kit/sortable";
import { VariableSizeGrid as Grid } from "react-window";
import { Entry } from "@/Entry";
import { InventoryModel } from "./types";
import "@/Inventory.css";

interface InventoryProps {
  inventory: InventoryModel;
}

export const Inventory = ({ inventory }: InventoryProps) => {
  const columnCount = 10; // Adjust based on layout needs
  const rowCount = Math.ceil(inventory.entries.length / columnCount);

  // Dynamic row height function (if needed)
  const getRowHeight = () => 210; // Change as required

  // Dynamic column width function (if needed)
  const getColumnWidth = () => 150; // Change as required

  return (
    <SortableContext items={inventory.entries}>
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={getColumnWidth}
        rowHeight={getRowHeight}
        width={1600} // Set based on container
        height={1300} // Adjust height accordingly
        style={{ overflow: "auto" }} // Hide scrollbars
      >
        {({ columnIndex, rowIndex, style }) => {
          const entryIndex = rowIndex * columnCount + columnIndex;
          if (entryIndex >= inventory.entries.length) return null;
          const entry = inventory.entries[entryIndex];

          return (
            <div style={style}>
              <Entry key={entry.id} entry={entry} />
            </div>
          );
        }}
      </Grid>
    </SortableContext>
  );
};
