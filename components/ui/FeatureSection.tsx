import { Card, Checkbox } from "react-daisyui";

const FeatureSection = ({ }) => {
    return (
        <div>
            <Card className="border-none">
                <Card.Body className="items-center">
                    <Card.Title tag="h2" className="normal-case text-4xl font-bold">Features</Card.Title>
                    <div className="grid grid-cols-2 text-xl">
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Create account
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Sign in with Email and Password
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Sign in with Magic divnk
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Sign in with SAML SSO
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Directory Sync (SCIM)
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Update account
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Invite users to the team
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Manage team members
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Update team settings
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Webhooks & Events
                        </div>
                        <div>
                            <Checkbox checked color="primary" className="m-2" />
                            Create team
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FeatureSection;