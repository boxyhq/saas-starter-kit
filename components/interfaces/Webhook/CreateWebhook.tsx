import type { FormikHelpers } from "formik";
import React from "react";
import toast from "react-hot-toast";
import axios from "axios";

import type { ApiResponse } from "types";
import type { Team } from "@prisma/client";
import useWebhooks from "hooks/useWebhooks";
import ModalForm from "./Form";
import type { WebookFormSchema } from "types";

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

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    const { name, url, eventTypes } = values;

    const response = await axios.post<ApiResponse>(
      `/api/teams/${team.slug}/webhooks`,
      { name, url, eventTypes }
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
    setVisible(false);
    formikHelpers.resetForm();
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: "",
        url: "",
        eventTypes: [],
      }}
      onSubmit={onSubmit}
    />
  );
};

export default CreateWebhook;
