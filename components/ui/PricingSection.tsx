import { Button, Card, Checkbox } from "react-daisyui";
import pricing from "data/pricing.json";

const PricingSection = () => {

    return (
        <Card className="border-none">
            <Card.Body className="items-center text-center">
                <Card.Title tag="h2" className="normal-case text-4xl font-bold">Pricing</Card.Title>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {
                        pricing.map((price: any, index) => {
                            return (
                                <div key={index}>
                                    <Card>
                                        <Card.Body className="items-center">
                                            <Card.Title tag="h2">{price.currency} {price.amount}/{price.duration}</Card.Title>
                                            <p>{price.description}</p>
                                            <div className="grid grid-cols-1 gap-1"></div>
                                            {
                                                price.benefits.map((benefit: any) => {
                                                    return (
                                                        <div key={index}>
                                                            <Checkbox checked color="primary" className="m-2" size="xs" />
                                                            {benefit}
                                                        </div>
                                                    )
                                                })
                                            }
                                        </Card.Body>
                                        <Card.Actions className="justify-center">
                                            <Button color="primary" className="w-full">Buy Now</Button>
                                        </Card.Actions>
                                    </Card>
                                </div>
                            );
                        })
                    }
                </div>
            </Card.Body>
        </Card>
    );
};

export default PricingSection;