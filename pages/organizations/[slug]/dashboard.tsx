import type { NextPageWithLayout } from "types";

const Dashboard: NextPageWithLayout = () => {
  return (
    <div className="px-4 pt-6">
      <div className="grid w-full grid-cols-1 gap-4">
        <div className="rounded bg-white p-4 sm:p-6 xl:p-8 ">Dashboard 1</div>
      </div>
    </div>
  );
};

export default Dashboard;
