import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const TogglePasswordVisibility = ({
  isPasswordVisible,
  handlePasswordVisibility,
}) => {
  return (
    <button
      onClick={handlePasswordVisibility}
      className="flex pointer items-center text-white absolute right-3 top-[50px]"
      type="button"
    >
      {!isPasswordVisible ? (
        <EyeIcon className="h-6 w-4 text-primary" />
      ) : (
        <EyeSlashIcon className="h-6 w-4 text-primary" />
      )}
    </button>
  );
};

export default TogglePasswordVisibility;
