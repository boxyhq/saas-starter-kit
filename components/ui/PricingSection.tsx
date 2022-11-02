import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Checkbox } from "react-daisyui";
import Spinner from "./Spinner";

const PricingSection = ({ }) => {
    const [pricing, setPricing] = useState<any[]>([]);
    const [loading, isLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/info/pricing`).then((pricing) => {
            setPricing(pricing.data);
            isLoading(false);
        })
    }, []);

    return (
        <Card className="border-none">
            <Card.Body className="items-center text-center">
                <Card.Title tag="h2" className="normal-case text-4xl font-bold">Pricing</Card.Title>
                {loading && <Spinner />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {
                        pricing.map((price) => {
                            return (
                                <div>
                                    <Card>
                                        <Card.Body className="items-center">
                                            <Card.Title tag="h2">{price.currency} {price.amount}/{price.duration}</Card.Title>
                                            <p>{price.description}</p>
                                            <div className="grid grid-cols-1 gap-1"></div>
                                            {
                                                price.benefits.map((benefit: any) => {
                                                    return (
                                                        <div>
                                                            <Checkbox checked color="primary" className="m-2" size="xs"/>
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