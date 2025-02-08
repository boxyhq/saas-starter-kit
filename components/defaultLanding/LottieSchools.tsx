import { DotLottiePlayer } from '@dotlottie/react-player';
import { useEffect, useRef } from 'react';

const LottieSchools = () => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full">

      <DotLottiePlayer
        ref={playerRef}
        autoplay={false}
        loop={true}
        src="URL_ADDRESSottie.host/2b1ce6c4-3137-4f3d-a6d6-5d5d9a4b1a7c/7Zy8LyXWsE.json" />

    </div>
  );
};

export default LottieSchools;