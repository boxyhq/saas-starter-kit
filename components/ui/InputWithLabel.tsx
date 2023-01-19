import { Input } from 'react-daisyui';

const InputWithLabel = ({
  label,
  type = 'text',
  error,
  descriptionText,
  ...props
}: InputProps) => {
  const classes = Array<string>();

  if (error) {
    classes.push('input-error');
  }

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <Input className={classes.join(' ')} {...props} type={type} />
      {(error || descriptionText) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-red-500' : ''}`}>
            {error || descriptionText}
          </span>
        </label>
      )}
    </div>
  );
};

interface InputProps {
  label: string;
  name: string;
  onChange?(x: React.ChangeEvent<HTMLInputElement>): void;
  type?: string;
  error?: string;
  descriptionText?: string;
  placeholder?: string;
  value?: string;
}

export default InputWithLabel;
