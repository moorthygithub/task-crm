import useApiToken from "@/components/common/UseToken";
import Layout from "@/components/Layout";
import ErrorLoader from "@/components/loader/ErrorLoader";
import Loader from "@/components/loader/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Base_Url } from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateProject from "../project/CreateProject";
import EditProject from "../project/EditProject";


const PaymentList = () => {
    const token = useApiToken();

    const {
      data: project,
      isLoading,
      isError,
      refetch,
    } = useQuery({
      queryKey: ["payments"],
      queryFn: async () => {
        const response = await axios.get(
          `${Base_Url}/api/panel-fetch-project-list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data.project;
      },
    });
  
    // State for users table
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();
    const [projectTypeFilter, setProjectTypeFilter] = useState("Pending");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
    const getProjectDetails = (project) => {
      const types = project.project_types?.split(",") || [];
      const dates = project.project_due_dates?.split(",") || [];
      const subStatuses = project.projectSub_statuses?.split(",") || [];
  
      const maxLength = Math.max(types.length, dates.length, subStatuses.length);
      const details = [];
  
      for (let i = 0; i < maxLength; i++) {
        details.push({
          type: types[i] || "-",
          date: dates[i] ? moment(dates[i]).format("DD-MM-YYYY") : "-",
          subStatus: subStatuses[i] || "-",
        });
      }
  
      return details;
    };
    const projectTypesWithCounts = useMemo(() => {
      if (!project) return [];
  
      const typeCounts = project.reduce((acc, t) => {
        acc[t.project_payment_status] = (acc[t.project_payment_status] || 0) + 1;
        return acc;
      }, {});
  
      return Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
      }));
    }, [project]);
  
    const totalTaskCount = useMemo(() => {
      if (!project) return 0;
      return project.length;
    }, [project]);
  
    const filteredTasks = useMemo(() => {
      if (!project) return [];
      if (projectTypeFilter == "all") return project;
      return project.filter((t) => t.project_payment_status == projectTypeFilter);
    }, [project, projectTypeFilter]);
  
    const statusColors = {
      Pending: "bg-yellow-500 text-white", // Yellow
      Confirmed: "bg-blue-500 text-white", // Blue
      "On Progress": "bg-cyan-500 text-white", // Light Blue
      Cancel: "bg-red-500 text-white", // Red
      Completed: "bg-green-500 text-white", // Green
      default: "bg-gray-400 text-white", // Default Gray
    };
    const paymentStatusColors = {
  
      Pending: "bg-yellow-500 text-white", // Yellow
      Advance: "bg-blue-500 text-white", // Blue
     
      Partial: "bg-red-500 text-white", // Red
      Closed: "bg-green-500 text-white", // Green
      default: "bg-gray-400 text-white", // Default Gray
    };
    const handleRowClick = (projectId) => {
      setSelectedProjectId(projectId);
      setIsEditModalOpen(true);
    };
    const columns = [
      {
        accessorKey: "index",
        header: "Sl No",
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        accessorKey: "client_name",
        header: "Client Name",
        cell: ({ row }) => <div>{row.getValue("client_name")}</div>,
      },
      {
        accessorKey: "project_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Project Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("project_name")}</div>,
      },
      {
        accessorKey: "project_desc",
        header: "Desc",
        cell: ({ row }) => <div>{row.getValue("project_desc")}</div>,
      },
      {
        accessorKey: "project_status",
        header: "Status",
        cell: ({ row }) => <div>{row.getValue("project_status")}</div>,
       
      },
      {
        accessorKey: "project_payment_status",
        header: "Status",
        cell: ({ row }) => {
          const paymentStatus = row.getValue("project_payment_status");
  
          return (
            <span
              className={`px-2 py-1 text-sm  rounded-md ${
                paymentStatusColors[paymentStatus] || paymentStatusColors.default
              }`}
            >
              {paymentStatus}
            </span>
          );
        },
      },
     
      {
        accessorKey: "project_details",
        header: "Project Details",
        cell: ({ row }) => {
          const details = getProjectDetails(row.original);
          return (
            <div className="space-y-1">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">{detail.type}</span>
                  <span>-</span>
                  <span>{detail.date}</span>
                  <span>-</span>
                  <span
                    className={
                      detail.subStatus === "Confirmed"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {detail.subStatus}
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
  
    ];
  
    const table = useReactTable({
      data: filteredTasks || [],
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
      initialState: {
        pagination: {
          pageSize: 7,
        },
      },
    });
  
  
    // Render loading state
    if (isLoading) {
      return (
        <Layout>
          <Loader data="Project" />
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
        <div className="w-full p-4 ">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Payment Project List
          </div>
          {/* searching and column filter  */}
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search project..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
  
            <CreateProject onSuccess={refetch} />
          </div>
          {/* table  */}
          <div className=" mb-2 overflow-x-auto">
            <Tabs
              value={projectTypeFilter}
              onValueChange={setProjectTypeFilter}
              className="w-full"
            >
              <TabsList className="flex w-full justify-between md:justify-start gap-2">
               
                {projectTypesWithCounts.map(({ type, count }) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="flex-1 md:flex-initial whitespace-nowrap"
                  >
                    {type}
                    <Badge variant="secondary" className="ml-2">
                      {count}
                    </Badge>
                  </TabsTrigger>
                ))}
                 <TabsTrigger
                  value="all"
                  className="flex-1 md:flex-initial whitespace-nowrap"
                >
                  All Projects
                  <Badge variant="secondary" className="ml-2">
                    {totalTaskCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              {/* <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody> */}
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => handleRowClick(row.original.id)} // ✅ Add this!
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Payment Projects : &nbsp;
              {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
  
          {selectedProjectId && isEditModalOpen && (
            <EditProject
              projectId={selectedProjectId}
              open={isEditModalOpen}
              setOpen={setIsEditModalOpen}
              onSuccess={() => {
                refetch();
                setIsEditModalOpen(false);
              }}
            />
          )}
        </div>
      </Layout>
    );
  };

export default PaymentList