import type { NextPageWithLayout } from "types";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { Input, Button, Typography } from "@supabase/ui";
import { useState } from "react";
import React from "react";
import toast from "react-hot-toast";

import type { User } from "@prisma/client";
import { getSession } from "@lib/session";
import { put } from "@lib/fetch";
import users from "models/users";

const Account: NextPageWithLayout<Props> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const { data, error } = await put("/api/users", {
      name: form.name,
    });

    setLoading(false);

    if (!error && data) {
      toast.success("Successfully updated profile");
    }
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = event.target as HTMLInputElement;

    setForm({ ...form, [target.name]: target.value });
  };

  return (
    <div className="px-4 pt-6">
      <div className="rounded bg-white p-6">
        <div className="border-b border-gray-300 pb-3">
          <Typography.Title level={3}>Account</Typography.Title>
        </div>
        <div className="mt-6 grid grid-cols-3">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Name"
              type="text"
              name="name"
              value={form.name || ""}
              required
              onChange={onChange}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              defaultValue={form.email || ""}
              readOnly
              disabled
            />
            <Button size="medium" loading={loading}>
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await users.getUserBySession(session);

  return {
    props: {
      user: {
        name: user?.name,
        email: user?.email,
      },
    },
  };
};

type Props = {
  user: User;
};

export default Account;
