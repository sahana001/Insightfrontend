import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import axios from "axios";
import Chart from "react-apexcharts";
import moment from "moment";

function Dashboard() {
  const [insightData, setInsightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barChartXAxis, setBarChartXAxis] = useState([]);
  const [barChartYAxis, setBarChartYAxis] = useState([]);
  const [pieChartLabel, setPieChartLabel] = useState([]);
  const [pieChartValue, setPieChartValue] = useState([]);
  const [multiSeriesData, setMultiSeriesData] = useState([]);
  const [multiSeriesDataX, setMultiSeriesDataX] = useState([]);

  async function getInsightData() {
    await axios
      .get("http://localhost:3010/getinsight")
      .then((res) => {
        const data = res.data.data;
        setInsightData(res.data.data);
        let intensity_data_by_date = [];
        let relevance_data_by_region = [];
        let multi_data_by_pestle = [];

        // looping through each element
        for (let index = 0; index < data.length; index++) {
          const element = data[index];

          // -----------------------------------------> date and intensity
          const existing_date_index = intensity_data_by_date.findIndex(
            (val) => val.added.slice(0, -8) === element.added.slice(0, -8)
          );
          if (existing_date_index > -1) {
            intensity_data_by_date[existing_date_index].intensity =
              intensity_data_by_date[existing_date_index].intensity +
              element.intensity;
          } else {
            intensity_data_by_date.push(element);
          }

          // -------------------------------------------> region and relevance
          const existing_region_index = relevance_data_by_region.findIndex(
            (val) => val.region === element.region
          );
          if (existing_region_index > -1) {
            relevance_data_by_region[existing_region_index].relevance =
              relevance_data_by_region[existing_region_index].relevance +
              element.relevance;
          } else {
            if (element.region !== "") {
              relevance_data_by_region.push(element);
            } else {
              const others_index = relevance_data_by_region.findIndex(
                (val) => val.region === "Others"
              );
              if (others_index > -1) {
                relevance_data_by_region[others_index].relevance =
                  relevance_data_by_region[others_index].relevance +
                  element.relevance;
              } else {
                element.region = "Others";
                relevance_data_by_region.push(element);
              }
            }
          }

          // -----------------------------------------> relevance, intensity, likelihood and pestle
          const existing_pestle_index = multi_data_by_pestle.findIndex(
            (val) => val.pestle === element.pestle
          );
          if (existing_pestle_index > -1) {
            multi_data_by_pestle[existing_pestle_index].likelihood =
              parseInt(multi_data_by_pestle[existing_pestle_index].likelihood) +
              parseInt(element.likelihood);
            multi_data_by_pestle[existing_pestle_index].relevance =
              parseInt(multi_data_by_pestle[existing_pestle_index].relevance) +
              parseInt(element.relevance);
            multi_data_by_pestle[existing_pestle_index].intensity =
              parseInt(multi_data_by_pestle[existing_pestle_index].intensity) +
              parseInt(element.intensity);
          } else {
            multi_data_by_pestle.push(element);
          }
        }

        const arr = data.filter(
          (val) => val.sector === "Energy" && val.pestle === "Industries"
        );
        console.log(arr);

        // ---------------------------------------> removing empty data
        multi_data_by_pestle.splice(0, 1);
        multi_data_by_pestle.splice(4, 1);
        multi_data_by_pestle.splice(0, 1);

        // ----------------------------------------> sorted array and slicing
        const sorted_bar_data = intensity_data_by_date
          .sort((a, b) => {
            return (
              new Date(b.added.slice(0, -8)) - new Date(a.added.slice(0, -8))
            );
          })
          .reverse()
          .slice(20, 50);

        // x axis of bar graph in the form of ['date', 'date']
        const _barChartX = sorted_bar_data.map((item) => {
          return moment(item.added).format("DD/MM");
        });
        setBarChartXAxis(_barChartX);

        // y axis of bar graph in the form of [22, 18]
        const _barChartY = sorted_bar_data.map((item) => {
          return item.intensity;
        });
        setBarChartYAxis(_barChartY);

        //----------------------------------------> pie chart label
        const regions = relevance_data_by_region.map((item) => item.region);
        setPieChartLabel(regions);

        // pie chart relevance
        const _relevance = relevance_data_by_region.map(
          (item) => item.relevance
        );
        setPieChartValue(_relevance);

        // ---------------------------------------------------> multi data parser
        const likelihood = multi_data_by_pestle.map((item) => item.likelihood);
        const relevance = multi_data_by_pestle.map((item) => item.relevance);
        const intensity = multi_data_by_pestle.map((item) => item.intensity);

        const multi_series_data = [
          {
            name: "Likelihood",
            data: likelihood,
          },
          {
            name: "Intensity",
            data: intensity,
          },
          {
            name: "Relevance",
            data: relevance,
          },
        ];

        setMultiSeriesData(multi_series_data);
        const _multiChartX = multi_data_by_pestle.map((item) => {
          return item.pestle;
        });
        setMultiSeriesDataX(_multiChartX);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getInsightData();
  }, []);

  // ------------------------------> bar chart options
  const options = {
    colors: ["#3282B8"],
    chart: {
      id: "basic-bar",
      fontFamily: "Poppins",
    },
    plotOptions: {
      dataLabels: {
        enable: true,
        style: {
          colors: ["#f00"],
        },
      },
    },
    dataLabels: {
      style: {
        color: "red",
      },
    },
    xaxis: {
      categories: barChartXAxis,
      labels: {
        style: {
          fontFamily: "Poppins",
          fontWeight: "bold",
          fontSize: 14,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "Poppins",
          fontWeight: "bold",
          fontSize: 14,
        },
      },
    },
  };

  const YAxisData = [
    {
      name: "Intensity",
      data: barChartYAxis,
    },
  ];

  // -----------------------------------> pie chart
  const pieChartOptions = {
    chart: {
      id: "basic-pie",
      fontFamily: "Poppins",
    },
    labels: pieChartLabel,
    dataLabels: {
      style: {
        color: "red",
      },
    },
  };

  // ------------------------------------> area graph x axis

  const areaGraphOptions = {
    colors: ["#4F6F52", "#29ADB2", "#FF9800"],
    chart: {
      id: "basic-area",
      fontFamily: "Poppins",
    },
    legend: {
      position: "top",
    },
    xaxis: {
      categories: multiSeriesDataX,
      labels: {
        style: {
          fontFamily: "Poppins",
          fontWeight: "bold",
          fontSize: 14,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: "Poppins",
          fontWeight: "bold",
          fontSize: 14,
        },
      },
    },
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Dashboard</h1>
        <div className="hor">
          <img
            className="avatar"
            src="https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg"
            alt="profile"
          />
        </div>
      </div>
      {loading === true ? (
        <h1>Loading...</h1>
      ) : (
        <div className="charts_container">
          <div className="bar_chart">
            <h3 className="graph_title">Intensity Graph</h3>
            <Chart
              options={options}
              series={YAxisData}
              type="bar"
              height={800}
            />
          </div>
          <div className="h_stack">
            <div className="area_chart">
              <h3 className="graph_title">
                Relevance, Likelihood, Intensity data by Pestle
              </h3>
              <Chart
                options={areaGraphOptions}
                series={multiSeriesData}
                type="area"
              />
            </div>
            <div className="pie_chart">
              <h3 className="graph_title">Relevance Pie Chart</h3>
              <div style={{ marginTop: 70 }}></div>
              <Chart
                options={pieChartOptions}
                series={pieChartValue}
                type="pie"
                width={700}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
