import React from "react";
import ReactECharts from "echarts-for-react";
import get from "lodash.get";
import GenericTableComponent from "./GenericTableComponent";

const DynamicAutoChart = ({
  apiResponse,
  api_payload,
  chartType,
  title = "",
  aggregateKey = "-20",
}) => {
  const totalKey = "-20";
  if (!apiResponse) return <p>No data to display.</p>;

  const aggregateData =
    apiResponse.agentIdtoFieldToFieldValueMap[Number(totalKey)] || {};

  const fieldList = api_payload || {};

  if (!chartType) {
    chartType = "table";
  }

  if (chartType === "table") {
    return (
      <GenericTableComponent
        apiResponse={apiResponse}
        api_payload={fieldList}
      />
    );
  }

  const chartData = Object.entries(fieldList)
    .flatMap(([section, fields]) =>
      fields.map((field) => {
        const valuePath = `${section}.${field.key}.value`;
        const rawValue = get(aggregateData, valuePath);
        const value = parseFloat(rawValue);
        const isMissing = rawValue === undefined;

        return {
          name: field.displayName || field.key,
          value: isNaN(value) ? 0 : value,
          itemStyle: isMissing ? { color: "#cccccc" } : undefined,
        };
      })
    )
    .filter((item) => item.name);

  const strongColors = [
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
  ];

  const getOptions = () => {
    const labels = chartData.map((item) => item.name);
    const values = chartData.map((item) => item.value);

    const baseOptions = {
      backgroundColor: "#ffffff",
      title: {
        text: title,
        left: "center",
        textStyle: {
          fontSize: 22,
          fontWeight: "bold",
          color: "#222",
        },
      },
      tooltip: {
        trigger: chartType === "pie" ? "item" : "axis",
        backgroundColor: "#222",
        borderColor: "#999",
        textStyle: {
          color: "#fff",
          fontSize: 14,
        },
      },
      legend: {
        orient: "horizontal",
        bottom: 0,
        textStyle: {
          fontSize: 14,
          color: "#444",
        },
      },
      animation: true,
      animationDuration: 1000,
    };

    const seriesConfig = {
      name: "Value",
      type: chartType,
      radius: chartType === "pie" ? ["40%", "70%"] : undefined,
      data: chartData.map((item, index) => ({
        ...item,
        itemStyle: {
          ...item.itemStyle,
          color:
            item.itemStyle?.color || strongColors[index % strongColors.length],
        },
      })),
      label: {
        show: true,
        fontSize: 14,
        color: "#222",
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 15,
          shadowColor: "rgba(0, 0, 0, 0.4)",
        },
      },
      ...(chartType === "bar" && {
        barWidth: "50%",
      }),
      ...(chartType === "line" && {
        smooth: true,
        lineStyle: {
          width: 3,
          color: "#3366CC",
        },
        symbolSize: 10,
        itemStyle: {
          color: "#3366CC",
        },
      }),
    };

    return {
      ...baseOptions,
      ...(chartType !== "pie" && {
        xAxis: {
          type: "category",
          data: labels,
          axisLine: { lineStyle: { color: "#aaa" } },
          axisLabel: { color: "#333", fontSize: 13 },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#aaa" } },
          splitLine: { lineStyle: { color: "#eaeaea" } },
          axisLabel: { color: "#333", fontSize: 13 },
        },
      }),
      series: [seriesConfig],
    };
  };

  if (!chartData.length) {
    return (
      <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
        No aggregate ({aggregateKey}) data available.
      </p>
    );
  }

  return (
    <div
      style={{
        width: window.location.pathname === "/dashboard" ? "85%" : "100%",
        maxWidth: "950px",
        margin: "20px auto",
        background: "#fff",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <ReactECharts
        option={getOptions()}
        style={{ height: "480px" }}
        opts={{ devicePixelRatio: window.devicePixelRatio }}
      />
    </div>
  );
};

export default DynamicAutoChart;
