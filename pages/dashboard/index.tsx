import React from "react";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "@/types";
import Widget from "./Widget";
import { MdBarChart } from "react-icons/md";
import { IoDocuments, IoSpeedometer } from "react-icons/io5";
import ColumnsTable from "./ColumnsTable";
import PieChart from "./PieChart";
import ProductIssue from "./ProductIssue";
import ServiceComplaint from "./ServiceComplaint";
import UploadCSV from "../source/csvupload";

const Dashboard: NextPageWithLayout = () => {
  const columnsData = [
    {
      Header: "Feature Name",
      accessor: "name",
    },
    {
      Header: "Quantity",
      accessor: "quantity",
    },
    
    {
      Header: "%",
      accessor: "progress",
    },
  ];

  const tableData = [
    {
      name: "Marketplace",
      quantity: 2458,
      progress: 75.5,
    },
    {
      name: "Venus DB PRO",
      quantity: 1485,
      progress: 35.4,
    },
    {
      name: "Venus DS",
      quantity: 1024,
      progress: 25,
    },
    {
      name: "Venus 3D Asset",
      quantity: 858,
      progress: 100,
    },
    {
      name: "Marketplace",
      quantity: 258,
      progress: 75,
    },
  ];

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 w-full">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Feature Requests"}
          subtitle={"340"}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Product Issues"}
          subtitle={"642"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Compliments"}
          subtitle={"574"}
        />
        <Widget
          icon={<IoSpeedometer className="h-6 w-6" />}
          title={"Service Complaints"}
          subtitle={"1,000"}
        />
      </div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <ColumnsTable columnsData={columnsData} tableData={tableData} />
        <PieChart />
      </div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <ProductIssue columnsData={columnsData} tableData={tableData} />
        <ServiceComplaint columnsData={columnsData} tableData={tableData} />
      </div>
      <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
        <UploadCSV/>
        
      </div>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ["common"])
        : {}),
    },
  };
}

export default Dashboard;





