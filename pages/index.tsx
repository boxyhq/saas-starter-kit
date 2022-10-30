import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Button, Card, Checkbox, Hero, Link, Navbar } from "react-daisyui";

import { NextPageWithLayout } from "types";

const Home: NextPageWithLayout = () => {
  const router = useRouter();

  const openSignUpPage = () => {
    router.push("/auth/join");
  };

  return (
    <div className="bg-base-100">
      <Navbar>
        <img className="w-10" src="https://boxyhq.com/img/logo.png" alt="BoxyHQ" />
        <Link className="text-xl normal-case font-bold p-2" color="ghost" href="/">
          BoxyHQ
        </Link>
      </Navbar>
      <Hero>
        <Hero.Content>
          <img
            src="https://boxyhq.com/img/home-hero.svg"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">BoxyHQ Enterprise SaaS Starter Kit</h1>
            <p className="py-6">
              Next.js based Enterprise SaaS starter kit that saves you months of development.
            </p>
            <Button color="primary" onClick={() => openSignUpPage()}>Get Started</Button>
          </div>
        </Hero.Content>
      </Hero>
      <Card>
        <Card.Body className="items-center">
          <Card.Title tag="h2" className="normal-case text-4xl font-bold">Features</Card.Title>
          <div className="flex flex-row text-xl">
            <div className="mr-20">
              <ul>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Create account
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Sign in with Email and Password
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Sign in with Magic Link
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Sign in with SAML SSO
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Directory Sync (SCIM)
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Update account
                </li>
              </ul>
            </div>
            <div className="ml-20">
              <ul>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Invite users to the team
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Manage team members
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Update team settings
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Webhooks & Events
                </li>
                <li>
                  <Checkbox checked color="primary" className="m-2"/>
                  Create team
                </li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
