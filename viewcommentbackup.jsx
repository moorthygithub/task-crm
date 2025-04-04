import ButtonConfigColor from "@/components/buttonComponent/ButtonConfig";
import useApiToken from "@/components/common/UseToken";
import Layout from "@/components/Layout";
import ErrorLoader from "@/components/loader/ErrorLoader";
import Loader from "@/components/loader/Loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Base_Url } from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
const TaskCard = ({ task }) => {
  return (
    <div className="bg-gray-100 rounded-xl shadow-md p-4 flex justify-between items-center">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-gray-900">
          {task.project_name}
        </h2>
        <p className="text-[10px] text-gray-700">{task.task_title}</p>
      </div>

      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 text-white text-lg font-medium">
        {task.to_name ? task.to_name.charAt(0).toUpperCase() : "?"}
      </div>
    </div>
  );
};

const FullReport = () => {
  const containerRef = useRef();
  const token = useApiToken();

  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["task"],
    queryFn: async () => {
      const response = await axios.post(
        `${Base_Url}/api/panel-fetch-project-task-pending-list-report
`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.task || [];
    },
    enabled: false,
  });
  useEffect(() => {
    refetch();
  }, []);
  const groupedByProject = (task ?? []).reduce((acc, project) => {
    if (!acc[project.project_type]) {
      acc[project.project_type] = {};
    }
    if (!acc[project.project_type][project.project_type]) {
      acc[project.project_type][project.project_type] = [];
    }
    acc[project.project_type][project.project_type].push(project);
    return acc;
  }, {});
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Task Report",
    pageStyle: `
      @page {
        size: A4 portrait; /* 
        margin: 5mm; 
      }
  
      @media print {
        body {
          font-size: 10px; 
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
  
        table {
          font-size: 11px;
          width: 100%;
          border-collapse: collapse;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });

  if (isLoading) {
    return (
      <Layout>
        <Loader data={"Project Task Report"} />
      </Layout>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Layout>
        <ErrorLoader onSuccess={refetch} />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="overflow-x-auto p-4">
        <div className="flex justify-between">
          <h2 className="text-2xl">Full Report </h2>

          <ButtonConfigColor
            type="button"
            buttontype="print"
            label="Print"
            onClick={handlPrintPdf}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="flex justify-center">
            <h2 className="text-2xl my-3 hidden print:block">
              Project Assign Report
            </h2>
          </div>

          {Object.entries(groupedByProject).map(
            ([projectName, types], index) => (
              <div key={index} className="mb-6  rounded-lg shadow-lg">
                {Object.entries(types).map(
                  ([projectType, tasks], typeIndex) => (
                    <div key={typeIndex} className="mb-4">
                      <div className="text-xs font-bold p-2 bg-gray-200 print:bg-white border-b border-black my-3">
                        {projectType}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                        {tasks.map((task, idx) => (
                          <TaskCard key={idx} task={task} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )}
          {task?.length === 0 && (
            <div className="text-center font-semibold text-red-500 py-4">
              No Task Available
            </div>
          )}
        </div>
        <div className="overflow-x-auto hidden print:block" ref={containerRef}>
          <div className="flex justify-center">
            <h2 className="text-2xl my-3 hidden print:block">
              Project Assign Report
            </h2>
          </div>

          {Object.entries(groupedByProject).map(
            ([projectName, types], index) => (
              <div key={index} className="mb-6  rounded-lg shadow-lg">
                {Object.entries(types).map(
                  ([projectType, tasks], typeIndex) => (
                    <div key={typeIndex} className="mb-4">
                      <div className="text-xs font-bold p-2 bg-gray-200 print:bg-white border-b border-black my-3">
                        {projectType}
                      </div>
                      <div className="grid  grid-cols-4 gap-4 p-4">
                        {tasks.map((task, idx) => (
                          <TaskCard key={idx} task={task} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )}
          {task?.length === 0 && (
            <div className="text-center font-semibold text-red-500 py-4">
              No Task Available
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FullReport;
