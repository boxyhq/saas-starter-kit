import { Button, Card } from "react-daisyui";

const PricingSection = ({ }) => {
    return (
        <Card className="border-none">
            <Card.Body className="items-center text-center">
                <Card.Title tag="h2" className="normal-case text-4xl font-bold">Pricing</Card.Title>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Card>
                            <Card.Body className="items-center">
                                <Card.Title tag="h2">$30k/month</Card.Title>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                            </Card.Body>
                            <Card.Actions className="justify-center">
                                <Button color="primary" className="w-full">Buy Now</Button>
                            </Card.Actions>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <Card.Body className="items-center">
                                <Card.Title tag="h2">$120k/month</Card.Title>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                            </Card.Body>
                            <Card.Actions className="justify-center">
                                <Button color="primary" className="w-full">Buy Now</Button>
                            </Card.Actions>
                        </Card>
                    </div>
                    <div>
                    <Card>
                            <Card.Body className="items-center">
                                <Card.Title tag="h2">$350k/month</Card.Title>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
                            </Card.Body>
                            <Card.Actions className="justify-center">
                                <Button color="primary" className="w-full">Buy Now</Button>
                            </Card.Actions>
                        </Card>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PricingSection;