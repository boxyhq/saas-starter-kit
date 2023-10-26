import app from '@/lib/app';

const Brand = () => {
  return (
    <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2">
      <img className="h-7 w-auto" src={app.logoUrl} alt={app.name} />
      {app.name}
    </div>
  );
};

export default Brand;
