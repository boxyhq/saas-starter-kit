import type { EndpointOut } from "svix";
import React from "react";
import { Button } from "react-daisyui";
import axios from "axios";
import toast from "react-hot-toast";

import { Card, Error, Loading } from "@/components/ui";
import { Team } from "@prisma/client";
import useWebhooks from "hooks/useWebhooks";
import EditWebhook from "./EditWebhook";

const Webhooks = ({ team }: { team: Team }) => {
  const [visible, setVisible] = React.useState(false);
  const [endpoint, setEndpoint] = React.useState<EndpointOut | null>(null);

  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(
    team.slug
  );

  if (isLoading || !webhooks) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const deleteWebhook = async (webhook: EndpointOut) => {
    const response = await axios.delete(`/api/teams/${team.slug}/webhooks`, {
      data: {
        webhookId: webhook.id,
      },
    });

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    mutateWebhooks();

    toast.success("Webhook deleted successfully.");
  };

  return (
    <>
      <Card heading="Webhooks">
        <Card.Body>
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  URL
                </th>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => {
                return (
                  <tr
                    key={webhook.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">{webhook.description}</td>
                    <td className="px-6 py-3">{webhook.url}</td>
                    <td className="px-6 py-3">{webhook.createdAt}</td>
                    <td className="px-6 py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEndpoint(webhook);
                            setVisible(!visible);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            deleteWebhook(webhook);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card.Body>
      </Card>
      {endpoint && (
        <EditWebhook
          visible={visible}
          setVisible={setVisible}
          team={team}
          endpoint={endpoint}
        />
      )}
    </>
  );
};

export default Webhooks;
