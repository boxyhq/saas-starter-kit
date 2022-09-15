import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Button, Modal } from "react-daisyui";
import toast from "react-hot-toast";
import useSWR from "swr";

import type { Directory } from "@boxyhq/saml-jackson";
import type { ApiResponse } from "types";
import { Team } from "@prisma/client";
import fetcher from "@/lib/fetcher";
import { InputWithLabel, Loading } from "@/components/ui";
import useDirectory from "hooks/useDirectory";

const CreateDirectory = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { data } = useSWR("/api/idp", fetcher);
  const { mutateDirectory } = useDirectory(team.slug as string);

  const formik = useFormik({
    initialValues: {
      name: "",
      provider: "generic-scim-v2",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      provider: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { name, provider } = values;

      const response = await axios.post<ApiResponse<Directory>>(
        `/api/teams/${team.slug}/directory-sync`,
        {
          name,
          provider,
        }
      );

      const { data: directory, error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      }

      if (directory) {
        toast.success("Directory connection successfully.");
      }

      mutateDirectory();
      setVisible(false);
    },
  });

  if (!data) {
    return <Loading />;
  }

  const providers = data.data;

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">
          Create Directory Connection
        </Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-2">
            <p>
              Automatically provision and de-provision users with your directory
              provider.
            </p>
            <InputWithLabel
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
              placeholder="Example Directory"
              label="Directory Name"
            />
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Directory Sync Provider</span>
                <span className="label-text-alt"></span>
              </label>
              <select
                className="select select-bordered flex-grow"
                name="provider"
                onChange={formik.handleChange}
                value={formik.values.provider}
                required
              >
                {Object.keys(providers).map((key) => (
                  <option value={key} key={key}>
                    {providers[key]}
                  </option>
                ))}
              </select>
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
            Create Directory
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

export default CreateDirectory;
