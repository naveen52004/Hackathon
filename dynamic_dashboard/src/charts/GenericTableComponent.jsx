import React, { useState, useMemo } from "react";

const GenericTableComponent = ({
  apiResponse,
  api_payload,
  title = "Agent Performance Overview",
  theme = "dark",
  showSearch = true,
  pageSize = 10,
  compact = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced theme system with proper color values
  const themes = {
    modern: {
      gradient: "from-slate-900 to-slate-700",
      headerBg: "bg-slate-800",
      headerText: "text-white",
      border: "border-slate-200",
      evenRow: "bg-slate-50",
      oddRow: "bg-white",
      hoverRow: "hover:bg-blue-50",
      accent: "bg-blue-600",
      accentHover: "hover:bg-blue-700",
      text: "text-slate-700",
      mutedText: "text-slate-500",
    },
    professional: {
      gradient: "from-blue-900 to-blue-700",
      headerBg: "bg-blue-800",
      headerText: "text-white",
      border: "border-blue-100",
      evenRow: "bg-blue-25",
      oddRow: "bg-white",
      hoverRow: "hover:bg-blue-50",
      accent: "bg-blue-600",
      accentHover: "hover:bg-blue-700",
      text: "text-blue-900",
      mutedText: "text-blue-600",
    },
    dark: {
      gradient: "from-gray-900 to-gray-800",
      headerBg: "bg-gray-900",
      headerText: "text-gray-100",
      border: "border-gray-700",
      evenRow: "bg-gray-800",
      oddRow: "bg-gray-850",
      hoverRow: "hover:bg-gray-700",
      accent: "bg-indigo-600",
      accentHover: "hover:bg-indigo-700",
      text: "text-gray-100",
      mutedText: "text-gray-400",
    },
  };

  const currentTheme = themes[theme] || themes.modern;

  // Data validation and processing
  if (!apiResponse?.agentIdtoFieldToFieldValueMap) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-500">
            Please check your data source and try again.
          </p>
        </div>
      </div>
    );
  }

  const agentData = apiResponse.agentIdtoFieldToFieldValueMap;
  const agentIdToNameMap = apiResponse.agentIdtoAgentDetailMap || {};
  const fieldList = api_payload || {};

  // Process fields and create headers
  const allFields = Object.entries(fieldList).flatMap(([section, fields]) =>
    fields.map((field) => ({
      section,
      key: field.key,
      displayName: field.displayName || field.key,
      type: field.type || "text",
      format: field.format || null,
    }))
  );

  const headers = ["Agent Name", ...allFields.map((f) => f.displayName)];

  // Format values based on type
  const formatCellValue = (value, field) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "object" && value !== null)
    ) {
      return "—";
    }

    const numValue = Number(value);

    if (field?.type === "currency" && !isNaN(numValue)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numValue);
    }

    if (field?.type === "percentage" && !isNaN(numValue)) {
      return `${numValue.toFixed(1)}%`;
    }

    if (field?.type === "number" && !isNaN(numValue)) {
      return numValue.toLocaleString();
    }

    if (field?.type === "date") {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }

    return String(value);
  };

  // Build table rows
  const baseRows = useMemo(() => {
    return Object.entries(agentData)
      .filter(([agentId]) => agentId !== "-20") // <-- Exclude 'Total' row
      .map(([agentId, sectionData]) => {
        const agentDetail = agentIdToNameMap[agentId];
        const agentName = agentDetail?.name ?? `Agent ${agentId}`;

        const row = {
          "Agent Name": agentName,
          _agentId: agentId,
          _isTotal: false,
        };

        allFields.forEach(({ section, key, displayName, type, format }) => {
          const value = sectionData?.[section]?.[key]?.value;
          row[displayName] = value;
          row[`${displayName}_field`] = { section, key, type, format };
        });

        return row;
      });
  }, [agentData, agentIdToNameMap, allFields]);

  // Search functionality
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return baseRows;

    const searchLower = searchTerm.toLowerCase();
    return baseRows.filter((row) => {
      return Object.entries(row).some(([key, value]) => {
        if (key.startsWith("_") || key.includes("_field")) return false;
        return value && String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [baseRows, searchTerm]);

  // Sorting functionality
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined/empty values
      if (aVal === bVal) return 0;
      if (!aVal || aVal === "—") return 1;
      if (!bVal || bVal === "—") return -1;

      // Try numeric comparison first
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "desc" ? bNum - aNum : aNum - bNum;
      }

      // String comparison
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  }, [filteredRows, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  // Sort icon component
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div
      className={`${
        window.location.pathname === "/dashboard" ? "w-5/6 ml-25" : "w-full"
      } bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden`}
    >
      {/* Header Section */}
      <div
        className={`bg-gradient-to-r ${currentTheme.gradient} px-4 sm:px-6 py-6`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {title}
            </h2>
          </div>

          {showSearch && (
            <div className="w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 bg-white border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section with responsive horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full table-auto">
            <thead className="bg-gray-800">
              <tr className="border-b border-gray-200">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    className={`
                      ${compact ? "px-3 py-3" : "px-4 py-4"} 
                      text-left text-xs sm:text-sm font-semibold text-white
                      cursor-pointer hover:bg-gray-700 transition-colors duration-150
                      ${
                        index === 0
                          ? "min-w-[150px] sticky left-0 z-10 bg-gray-800"
                          : "min-w-[100px]"
                      }
                      select-none border-r border-gray-600 last:border-r-0
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{header}</span>
                      <SortIcon column={header} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedRows.map((row, index) => (
                <tr
                  key={`${row._agentId}-${index}`}
                  className={`
                    transition-colors duration-150
                    ${
                      row._isTotal
                        ? "bg-blue-50 border-t-2 border-blue-200 font-semibold"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                    ${!row._isTotal ? "hover:bg-blue-50" : ""}
                  `}
                >
                  {headers.map((header, cellIndex) => {
                    const field = allFields.find(
                      (f) => f.displayName === header
                    );
                    const value = row[header];

                    return (
                      <td
                        key={`${index}-${header}`}
                        className={`
                          ${compact ? "px-3 py-3" : "px-4 py-4"}
                          text-xs sm:text-sm border-r border-gray-100 last:border-r-0
                          ${
                            cellIndex === 0
                              ? "font-medium text-gray-900 sticky left-0 z-10 bg-inherit min-w-[150px]"
                              : "text-gray-700"
                          }
                          ${row._isTotal ? "font-semibold text-blue-800" : ""}
                        `}
                      >
                        <div
                          className={`
                          truncate max-w-[120px] sm:max-w-none
                          ${cellIndex === 0 ? "text-left" : ""}
                          ${
                            field?.type === "currency" ||
                            field?.type === "number"
                              ? "font-mono text-right"
                              : ""
                          }
                          ${
                            field?.type === "percentage"
                              ? "font-medium text-center"
                              : ""
                          }
                        `}
                        >
                          {formatCellValue(value, field)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {paginatedRows.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, sortedRows.length)}
              </span>{" "}
              of <span className="font-medium">{sortedRows.length}</span>{" "}
              results
            </div>

            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }
                  transition-colors duration-200
                `}
              >
                Previous
              </button>

              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`
                        relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${
                          currentPage === page
                            ? "z-10 bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }
                        transition-colors duration-200
                      `}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }
                  transition-colors duration-200
                `}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericTableComponent;
