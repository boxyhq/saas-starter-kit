import features from "data/features.json";

const FeatureSection = () => {
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">Features</h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {features.map((feature: any, index) => {
              return (
                <div className="card-compact card w-96" key={index}>
                  <div className="card-body">
                    <h2 className="card-title">{feature.name}</h2>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
