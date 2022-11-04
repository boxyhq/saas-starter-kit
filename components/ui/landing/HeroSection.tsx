import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="hero py-52">
      <div className="hero-content text-center">
        <div className="max-w-7md">
          <h1 className="text-5xl font-bold">Enterprise SaaS Starter Kit</h1>
          <p className="py-6 text-2xl font-normal">
            Kickstart your enterprise app development with Next.js SaaS Starter
            Kit
          </p>
          <div className="flex items-center justify-center gap-2 ">
            <Link href="/auth/join">
              <a className="btn-primary btn px-8 no-underline">Get Started</a>
            </Link>
            <Link href="https://github.com/boxyhq/saas-starter-kit">
              <a className="btn-outline btn px-8">GitHub</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
