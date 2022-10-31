import env from "@/lib/env";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Checkbox } from "react-daisyui";

const FeatureSection = ({ }) => {
    const [features, setFeatures] = useState<any[]>([]);

    useEffect(() => {
        axios.get(`/api/info/features`).then((features) => {
            setFeatures(features.data);
        })
    },[]);

    return (
        <div>
            <Card className="border-none">
                <Card.Body className="items-center">
                    <Card.Title tag="h2" className="normal-case text-4xl font-bold">Features</Card.Title>
                    <div className="grid grid-cols-2 text-xl">
                        {
                            features.map((feature) => {
                                return (
                                    <div>
                                        <Checkbox checked color="primary" className="m-2" />
                                        {feature.name}
                                    </div>
                                )
                            })
                        }
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FeatureSection;