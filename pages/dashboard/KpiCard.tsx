import { Card, Grid, Metric, Text } from "@tremor/react";

const categories = [
  {
    title: "Feature Requests",
    metric: "456",
  },
  {
    title: "Product Issues",
    metric: "123",
  },
  {
    title: "Compliments",
    metric: "456",
  },
];

const KpiCard = () => {
  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
      {categories.map((item) => (
        <Card key={item.title}>
          <Text>{item.title}</Text>
          <Metric>{item.metric}</Metric>
        </Card>
      ))}
    </Grid>
  );
};

export default KpiCard;


