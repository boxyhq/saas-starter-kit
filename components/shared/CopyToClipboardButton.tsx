import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';

interface CopyToClipboardProps {
  value: string;
}

const CopyToClipboardButton = (props: CopyToClipboardProps) => {
  const { value } = props;

  const handleCopy = () => {
    copyToClipboard(value);
    toast.success('Copied to clipboard');
  };

  return (
    <Button
      variant="link"
      size="xs"
      className="tooltip p-0"
      data-tip="Copy"
      onClick={handleCopy}
    >
      <ClipboardDocumentIcon className="w-6 h-6" />
    </Button>
  );
};

export default CopyToClipboardButton;
