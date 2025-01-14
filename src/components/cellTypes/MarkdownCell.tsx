import { CellComponentProps } from "cdm/ComponentsModel";
import { TableColumn } from "cdm/FolderModel";
import { renderMarkdown } from "components/obsidianArq/MarkdownRenderer";
import { c } from "helpers/StylesHelper";
import { Link } from "obsidian-dataview";
import React, { useEffect, useRef } from "react";

const MarkdownCell = (mdProps: CellComponentProps) => {
  const { defaultCell } = mdProps;
  const { cell, table, row, column } = defaultCell;
  const tableColumn = column.columnDef as TableColumn;
  const { tableState } = table.options.meta;
  const markdownRow = tableState.data((state) => state.rows[row.index]);
  const mdRef = useRef<HTMLDivElement>();
  useEffect(() => {
    if (mdRef.current !== null) {
      mdRef.current.innerHTML = "";
      renderMarkdown(
        defaultCell,
        (markdownRow[tableColumn.key] as Link).markdown(),
        mdRef.current,
        5
      );
    }
  });
  return (
    <span
      ref={mdRef}
      className={`${c("md_cell")}`}
      key={`markdown_${cell.id}`}
    />
  );
};

export default MarkdownCell;
