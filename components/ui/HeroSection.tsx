import { useRouter } from "next/router";
import { Button, Hero } from "react-daisyui";

const HeroSection = ({ }) => {
    const router = useRouter();

    const openSignUpPage = () => {
        router.push("/auth/join");
    };
    
    return (
        <Hero>
            <Hero.Content>
                <img
                    src="https://boxyhq.com/img/home-hero.svg"
                    className="hidden md:block max-w-sm rounded-lg"
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
    );
};

export default HeroSection;