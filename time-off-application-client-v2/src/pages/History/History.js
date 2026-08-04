import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useAsyncRows from "./useAsyncRows";
import useColumns from "./useColumns";
import useComponents from "./useComponents";
import useSx from "./useSx";

const History = () => {
  const { loading, rows, refresh } = useAsyncRows();
  const columns = useColumns(refresh);
  const components = useComponents();
  const sx = useSx();

  return (
    <Box sx={sx.root}>
      <DataGrid
        loading={loading}
        rows={rows}
        columns={columns}
        components={components}
        pageSize={25}
      />
    </Box>
  );
};

export default History;