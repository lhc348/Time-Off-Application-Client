import { Chip, CircularProgress } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

import { GridActionsCellItem } from "@mui/x-data-grid";
import dayjs from "dayjs";
import formOptions from "constants/formOptions";
import nav from "constants/nav";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { withdrawApplication } from "api";

const useColumns = refresh => {
  const navigate = useNavigate();
  const [withdrawing, setWithdrawing] = useState({});
  const withdraw = async id => {
    setWithdrawing(withdrawing => ({
      ...withdrawing,
      [id]: true
    }));
    try {
      await withdrawApplication(id);
    } finally {
      setWithdrawing(withdrawing => ({
        ...withdrawing,
        [id]: false
      }));
    }
  };

  const handleEdit = application => () => navigate(nav.HOME.path, {
    state: {
      form: application
    }
  });

  const handleWithdraw = id => () => {
    (async () => {
      await withdraw(id);
      await refresh();
    })();
  };

  return [
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => value && (
        <Chip
          label={value}
          variant="outlined"
          size="small"
          color={
            value === "Approved"
              ? "success"
              : value === "Rejected"
                ? "error"
                : value === "Pending"
                  ? "info"
                  : "default"
          }
        />
      )
    },
    {
      field: "lastUpdated",
      headerName: "Last Update",
      valueFormatter: ({ value }) => value && dayjs(value).format("DD/MM/YYYY HH:mm"),
      width: 150
    },
    ...Array.from({ length: 2 }, (_, index) => ([
      {
        field: `timeOffDate${index + 1}`,
        headerName: `Time Off Date ${index + 1}`,
        valueGetter: ({ row }) => row.timeOffs[index]?.date,
        valueFormatter: ({ value }) => value && dayjs(value).format("DD/MM/YYYY"),
        width: 130
      },
      {
        field: `timeOffSession${index + 1}`,
        valueGetter: ({ row }) => row.timeOffs[index]?.session,
        headerName: `Time Off Session ${index + 1}`,
        width: 150
      }
    ])).flat(),
    {
      field: "taskDate",
      headerName: "Task Date",
      valueGetter: ({ row }) => row.task.date,
      valueFormatter: ({ value }) => value && dayjs(value).format("DD/MM/YYYY HH:mm"),
      width: 150
    },
    {
      field: "taskStatus",
      headerName: "Task Status",
      valueGetter: ({ row }) => row.task.status,
      width: 130
    },
    {
      field: "taskOnsite",
      headerName: "Task Onsite",
      valueGetter: ({ row }) => formOptions.task.onsite[row.task.onsite]
    },
    {
      field: "actions",
      type: "actions",
      getActions: ({ id, row }) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          onClick={handleEdit(row)}
          label="Edit"
        />,
        <GridActionsCellItem
          key="withDraw"
          icon={
            withdrawing[id]
              ? <CircularProgress color="inherit" size={20} />
              : <Delete />
          }
          onClick={handleWithdraw(id)}
          label="Withdraw"
          disabled={row.status === "Withdrawn" || withdrawing[id]}
        />
      ]
    }
  ];
};

export default useColumns;