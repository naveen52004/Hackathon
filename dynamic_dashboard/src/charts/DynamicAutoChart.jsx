import React from "react";
import ReactECharts from "echarts-for-react";
import get from "lodash.get";
import GenericTableComponent from "./GenericTableComponent";

const DynamicAutoChart = ({
  apiResponse,
  api_payload,
  chartType, // pie, bar, line
  title = "Dynamic Auto JSON Chart",
  aggregateKey = "-20", // ✅ Default key for aggregate data
}) => {
  const totalKey = "-20"; // Default key for total data
  if (!apiResponse) return <p>No data to display.</p>;
  const aggregateData = apiResponse.data.agentIdtoFieldToFieldValueMap[Number(totalKey)] || {};

  const fieldList = api_payload.keyToFieldList || {};

  if (chartType === "table") {
    return <GenericTableComponent apiResponse={apiResponse} api_payload={api_payload} />;
  }

  // 🔥 Build chartData dynamically
  const chartData = Object.entries(fieldList)
    .flatMap(([section, fields]) =>
      fields.map((field) => {
        const valuePath = `${section}.${field.key}.value`; // ✅ Correct template literal
        const rawValue = get(aggregateData, valuePath);
        const value = parseFloat(rawValue);
        const isMissing = rawValue === undefined;

        return {
          name: field.displayName || field.key, // fallback to key if displayName missing
          value: isNaN(value) ? 0 : value,
          itemStyle: isMissing ? { color: "#e0e0e0" } : undefined, // Gray if missing
        };
      })
    )
    .filter((item) => item.name);


  // 🎨 Common colors & gradient
  const colors = ["#3f51b5", "#f44336", "#009688", "#ffc107", "#9c27b0"];
  const gradient = {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: "#42a5f5" },
      { offset: 1, color: "#478ed1" },
    ],
  };

  const getOptions = () => {
    const labels = chartData.map((item) => item.name);
    const values = chartData.map((item) => item.value);

    const baseOptions = {
      backgroundColor: "#fafafa",
      title: {
        text: title,
        left: "center",
        textStyle: { fontSize: 20, fontWeight: "600", color: "#333" },
      },
      tooltip: {
        trigger: chartType == "pie" ? "item" : "axis",
        backgroundColor: "#333",
        borderColor: "#ccc",
        textStyle: { color: "#fff", fontSize: 14 },
      },
      legend: {
        orient: "horizontal",
        bottom: 0,
        textStyle: { fontSize: 14, color: "#666" },
      },
      animation: true,
      animationDuration: 1200,
    };

    const seriesConfig = {
      name: "Value",
      type: chartType,
      radius: chartType == "pie" ? ["40%", "70%"] : undefined, // Donut for pie
      data: chartData,
      itemStyle: {
        borderRadius: chartType == "bar" ? 8 : 0, // Rounded bars
        color: (params) =>
          params.data.itemStyle?.color ||
          colors[params.dataIndex % colors.length],
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
      },
      label: {
        fontSize: 14,
        color: "#555",
      },
      ...(chartType == "bar" && {
        barWidth: "50%",
        itemStyle: { color: gradient },
      }),
      ...(chartType == "line" && {
        smooth: true,
        lineStyle: { width: 4, color: gradient },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(66,165,245,0.5)" },
              { offset: 1, color: "rgba(66,165,245,0.1)" },
            ],
          },
        },
      }),
    };

    return {
      ...baseOptions,
      ...(chartType !== "pie" && {
        xAxis: {
          type: "category",
          data: labels,
          axisLine: { lineStyle: { color: "#ccc" } },
          axisLabel: { color: "#666", fontSize: 12 },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#ccc" } },
          splitLine: { lineStyle: { color: "#eee" } },
          axisLabel: { color: "#666", fontSize: 12 },
        },
      }),
      series: [seriesConfig],
    };
  };

  if (!chartData.length) {
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        No aggregate ({aggregateKey}) data available.
      </p>
    );
  }

  if (chartType == "line") {
    console.log("Line chart: Enabling smooth lines");
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "950px",
        margin: "20px auto",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <ReactECharts
        option={getOptions()}
        style={{ height: "500px" }}
        opts={{ devicePixelRatio: window.devicePixelRatio }}
      />
    </div>
  );
};

export default DynamicAutoChart;