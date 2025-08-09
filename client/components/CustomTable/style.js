import styled from "styled-components";

export const CustomTableContainer = styled.div`
  .custom-data-table {
    white-space: nowrap;
  }
  .rdt_Table {
    background: transparent;

    .__rdt_custom_sort_icon__ {
      line-height: 0px;
    }

    .__rdt_custom_sort_icon__ svg {
      width: unset;
      height: unset;
    }

    .rdt_TableCol,
    .rdt_TableCell {
      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border: 1px solid #c7c7c7;
        border-radius: 3px;
        background-color: transparent;
        cursor: pointer;
      }

      input[type="checkbox"]:checked {
        background-color: #ffffff;
        border-color: #0056b3;
      }

      input[type="checkbox"]:checked::after {
        content: "✔";
        display: block;
        background-color: #0070f3;
        color: black;
        font-size: 12px;
        text-align: center;
        line-height: 12px;
      }
    }

    .rdt_TableHead {
      background: #ffffff;
      border-radius: 8px 8px 0px 0px;
      .rdt_TableHeadRow {
        background: transparent;
        font-size: 14px;
        font-weight: 500;
        line-height: 16.8px;
        min-height: 35px !important;
        text-align: left;
        color: #767676;
        border: 1px solid #e1e1e1;
        border-radius: 8px;
      }
    }
    .rdt_TableBody {
      background: transparent;
      // padding-bottom: 50px;
      .rdt_TableRow {
        padding: 12px 0px;
        border-bottom: 1px solid #e1e1e1;
        font-size: 16px;
        font-weight: 500;
        line-height: 19.2px;
        letter-spacing: -0.02em;
        text-align: left;

        div {
          overflow: hidden;
        }
      }
    }
  }
  .rdt_Pagination {
    background: transparent !important;
  }
`;
