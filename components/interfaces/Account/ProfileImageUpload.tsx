import React, { ChangeEvent, useRef } from 'react';

const ProfileImageUpload = ({ formik }) => {
  const imageInputRef = useRef(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        formik.setFieldValue('image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="line-clamp-3 tracking-wide block mb-2 text-gray-700">
        Add a cover image
      </label>
      <div className="flex flex-col mb-8">
        <div>
          {formik.values.image && (
            <img
              src={formik.values.image}
              className="max-h-56 max-w-[224px] bg-gray-50 mr-8"
              alt=""
            />
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            id="cover_image"
            className="sr-only"
            ref={imageInputRef}
            onChange={(e)=> handleImageChange(e)}
          />
          <label
            className="bg-skin-base capitalize py-2 px-4 leading-6 border inline-flex flex-row justify-center items-center no-underline rounded-md font-semibold cursor-pointer transition duration-200 ease-in-out shadow-sm shadow-gray-100"
            htmlFor="cover_image"
          >
            change
          </label>
          {formik.touched.image && formik.errors.image && (
            <div className="text-red-500">{formik.errors.image}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
