import { Card, Checkbox } from "react-daisyui";

const FeatureSection = ({}) => {
    return (
        <div>
            <Card>
                <Card.Body className="items-center">
                    <Card.Title tag="h2" className="normal-case text-4xl font-bold">Features</Card.Title>
                    <div className="flex flex-row text-xl">
                        <div className="mr-20">
                            <ul>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Create account
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Sign in with Email and Password
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Sign in with Magic Link
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Sign in with SAML SSO
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Directory Sync (SCIM)
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Update account
                                </li>
                            </ul>
                        </div>
                        <div className="ml-20">
                            <ul>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Invite users to the team
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Manage team members
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Update team settings
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
                                    Webhooks & Events
                                </li>
                                <li>
                                    <Checkbox checked color="primary" className="m-2" />
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

export default FeatureSection;