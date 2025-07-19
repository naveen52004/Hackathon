import React from "react";

// GenericTableComponent: Displays data in a dynamic table
const GenericTableComponent = ({ apiResponse, api_payload }) => {
  if (
    !apiResponse ||
    !apiResponse.data ||
    !apiResponse.data.agentIdtoFieldToFieldValueMap
  ) {
    return (
      <p className="text-red-500 text-center p-4">
        No data to display in table.
      </p>
    );
  }

  const agentData = apiResponse.data.agentIdtoFieldToFieldValueMap;
  const agentIdToNameMap = apiResponse.data.agentIdtoAgentDetailMap || {};
  const fieldList = api_payload.keyToFieldList || {};

  // Create a flat list of all section + fieldKey combinations
  const allFields = Object.entries(fieldList).flatMap(([section, fields]) =>
    fields.map((field) => ({
      section,
      key: field.key,
      displayName: field.displayName || field.key,
    }))
  );

  // Build table headers: "Agent Name" + all display names
  const headers = ["Agent Name", ...allFields.map((f) => f.displayName)];

  // Build table rows for each agent
  const rows = Object.entries(agentData).map(([agentId, sectionData]) => {
    const agentDetail = agentIdToNameMap[agentId];
    const agentName =
      agentId === "-20" ? "Total" : agentDetail?.name ?? agentId;

    const row = { "Agent Name": agentName };

    allFields.forEach(({ section, key, displayName }) => {
      const value = sectionData?.[section]?.[key]?.value;
      row[displayName] = value ?? "-";
    });

    return row;
  });

  return (
    <div className="w-full max-w-full overflow-x-auto p-6 bg-white shadow-2xl rounded-xl font-sans">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
        Agent Performance Overview
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-200 border border-blue-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-700 text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider bg-blue-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-blue-50 hover:bg-blue-100 transition-colors duration-300 ease-in-out"
                }
              >
                {headers.map((header) => (
                  <td
                    key={`${index}-${header}`}
                    className="px-8 py-4 whitespace-nowrap text-sm text-gray-800"
                  >
                    {row[header] === null ||
                    row[header] === undefined ||
                    typeof row[header] === "object"
                      ? "-"
                      : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenericTableComponent;
