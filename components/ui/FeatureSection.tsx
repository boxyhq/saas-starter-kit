import { Card, Checkbox } from "react-daisyui";
import features from "data/features.json"

const FeatureSection = () => {

    return (
        <div>
            <Card className="border-none">
                <Card.Body className="items-center">
                    <Card.Title tag="h2" className="normal-case text-4xl font-bold">Features</Card.Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 text-xl gap-2">
                        {
                            features.map((feature, index) => {
                                return (
                                    <div key={index}>
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