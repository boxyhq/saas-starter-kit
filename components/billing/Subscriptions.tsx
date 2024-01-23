import { Service, Subscription } from '@prisma/client';

interface SubscriptionsProps {
  subscriptions: (Subscription & { product: Service })[];
}

const Subscriptions = ({ subscriptions }: SubscriptionsProps) => {
  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="card-title text-xl font-medium leading-none tracking-tight">
        Subscriptions
      </h2>
      <table className="table w-full text-sm border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Plan</th>
            <th>Start date</th>
            <th>End date</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td>{subscription.id}</td>
              <td>{subscription.product.name}</td>
              <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
              <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subscriptions;
