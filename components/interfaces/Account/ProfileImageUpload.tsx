import React, { useRef } from 'react';
// Other imports...

const ProfileImageUpload = ({ formik }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
    }
  };

  return (
    <div>
      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
        Upload Profile Image
      </label>
      <input
        type="file"
        id="image"
        accept="image/jpeg, image/png, image/gif"
        ref={imageInputRef}
        value={formik.values.image}
        className="sr-only"
        onChange={handleImageChange}
      />
      <button
        onClick={() => imageInputRef.current?.click()}
        className="mt-2 "
      >
        Select Image
      </button>
      {formik.values.image && (
        <div>
          <img
            src={URL.createObjectURL(formik.values.image)}
            alt="Selected"
            className="max-h-40 mt-2"
          />
        </div>
      )}
      {formik.touched.image && formik.errors.image && (
        <div className="text-red-500">{formik.errors.image}</div>
      )}
    </div>
  );
};

export default ProfileImageUpload;

