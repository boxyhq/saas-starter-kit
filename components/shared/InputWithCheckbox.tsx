import { Checkbox, CheckboxProps } from 'react-daisyui';

interface InputWithCheckboxProps extends CheckboxProps {
    label: string,
    error?: string;
    descriptionText?: string;
}

const InputWithCheckbox = (props: InputWithCheckboxProps) => {
    const { label, error, descriptionText, onChange, ...rest } = props;
    const classes = Array<string>();

    if (error) {
        classes.push('input-error');
    }

    return (
        <div className="form-control flex  flex-row items-center">
            <div className="space-x-2"> {/* Add spacing between checkbox and label */}
                <Checkbox type="checkbox" className='checkbox checkbox-primary checkbox-xs' onChange={onChange} />
                <span className="checkbox-toggle"></span>
            </div>
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
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

export default InputWithCheckbox;
