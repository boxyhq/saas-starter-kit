import { Card } from "react-daisyui"
import FAQs from "data/faq.json";

const FAQSection = ({ }) => {

    return (
        <div>
            <Card className="border-none">
                <Card.Body className="items-center">
                    <Card.Title tag="h2" className="normal-case text-4xl font-bold">Frequently Asked Questions</Card.Title>
                    <div className="grid grid-cols-1 text-xl">
                        {
                            FAQs.map((FAQ) => {
                                return (
                                    <Card className="border-none">
                                        <Card.Body className="items-left">
                                        <Card.Title tag="h2" >Q. {FAQ.question}</Card.Title>
                                        <p>A. {FAQ.answer}</p>
                                        </Card.Body>
                                    </Card>
                                )
                            })
                        }
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default FAQSection;