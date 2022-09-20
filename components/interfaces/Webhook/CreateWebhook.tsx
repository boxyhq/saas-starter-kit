import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal, Button } from "react-daisyui";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import { InputWithLabel } from "@/components/ui";
import useWebhooks from "hooks/useWebhooks";
import EventTypes from "./EventTypes";

const CreateWebhook = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { mutateWebhooks } = useWebhooks(team.slug);

  const formik = useFormik({
    initialValues: {
      name: "",
      url: "",
      eventTypes: [],
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      url: Yup.string().required().url(),
      eventTypes: Yup.array(),
    }),
    onSubmit: async (values) => {
      const { name, url, eventTypes } = values;

      const response = await axios.post<ApiResponse>(
        `/api/teams/${team.slug}/webhooks`,
        {
          name,
          url,
          eventTypes,
        }
      );

      const { data: webhooks, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (webhooks) {
        toast.success("Webhook created successfully.");
      }

      mutateWebhooks();
      formik.resetForm();
      setVisible(false);
    },
  });

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">Add Webhook Endpoint</Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>Create webhook to listen to events from app.</p>
            <div className="flex flex-col space-y-2">
              <InputWithLabel
                name="name"
                label="Description"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Description of what this endpoint is used for."
                error={formik.errors.name}
              />
              <InputWithLabel
                name="url"
                label="Endpoint"
                onChange={formik.handleChange}
                value={formik.values.url}
                placeholder="https://api.example.com/svix-webhooks"
                error={formik.errors.url}
                descriptionText="The endpoint URL must be HTTPS"
              />
              <div className="divider"></div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Events to send</span>
                </label>
                <p className="ml-1 text-sm font-normal text-gray-500">
                  You can choose which events are sent to which endpoint. By
                  default, all messages are sent to all endpoints.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <EventTypes onChange={formik.handleChange} />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            Create Webhook
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            Close
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default CreateWebhook;
