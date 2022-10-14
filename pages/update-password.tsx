import { inferSSRProps } from "@/lib/inferSSRProps";
import { NextPageWithLayout } from "types";
import { getServerSideProps } from "./account";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import toast from "react-hot-toast";

const UpdatePassword: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
    user,
}) => {

    const formik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmationPassword: ""
        },
        validationSchema: Yup.object().shape({
            currentPassword: Yup.string().required(),
            newPassword: Yup.string().required(),
            confirmationPassword: Yup.string().required()
        }),
        onSubmit: async (values) => {
            const { confirmationPassword } = values;

            const response = await axios.patch("/api/users/:id", {
                password: confirmationPassword
            });

            const { data, error } = response.data;

            if (error) {
                toast.error(error.message);
            }

            if (data) {
                toast.success("Successfully updated");
            }
        },
    });

    return (
            <>Update</>
    )
}

export default UpdatePassword;