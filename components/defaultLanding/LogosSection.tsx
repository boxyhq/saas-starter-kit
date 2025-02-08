import Image from 'next/image';

const LogosSection = () => {
  const logos = [
    { src: '/logos/logo1.png', alt: 'Partner 1' },
    { src: '/logos/logo2.png', alt: 'Partner 2' },
    { src: '/logos/logo3.png', alt: 'Partner 3' },
    { src: '/logos/logo4.png', alt: 'Partner 4' },
    { src: '/logos/logo5.png', alt: 'Partner 5' },
    { src: '/logos/logo6.png', alt: 'Partner 6' },
    { src: '/logos/logo7.png', alt: 'Partner 7' },
    { src: '/logos/logo8.png', alt: 'Partner 8' },
  ];

  return (
    <section className="overflow-hidden py-24 bg-base-100">
      <div className="container px-4 mx-auto">
        <h2 className="mb-12 text-2xl font-bold text-center">Trusted By</h2>
        
        <div className="relative py-8">
          {/* First row - moving right */}
          <div className="flex space-x-8 animate-scroll-right">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`right-${index}`}
                className="relative flex-shrink-0 w-32 h-16 grayscale transition-all duration-300 hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* Second row - moving left */}
          <div className="flex mt-8 space-x-8 animate-scroll-left">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`left-${index}`}
                className="relative flex-shrink-0 w-32 h-16 grayscale transition-all duration-300 hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogosSection;